import prisma from '../database/client.js';
import categorizer from '../categorizer/index.js';
import templateEngine from '../templateEngine/index.js';
import llmProvider from '../llmProvider/index.js';
import ttsService from '../ttsService/index.js';
import Response from '../models/Response.js';
import { Prisma } from '@prisma/client';
import LLMError from '../utils/errors/LLMError.js';
import TTSError from '../utils/errors/TTSError.js';
import webSocketManager from '../utils/WebSocketManager.js';

const SUMMARY_INTERVAL = 10; // Every 10 messages

class PromptOrchestrator {
  async handleQuestion({ question, wantsAudio, userId, idempotencyKey, chatId = null }) {

    const existingResponse = await this._getExistingResponse(idempotencyKey, userId);
    if (existingResponse) {
      return existingResponse;
    }

    let userMessage, chat;

    try {

      ({ userMessage, chat } = await prisma.$transaction(async (tx) => {
        return await this._initialWrite(tx, { question, userId, idempotencyKey, chatId });
      }));
      console.log(`Processing question for user ${userId} in chat ${chat.id}`);

      const { text, precis, fallbackUsed, audioUrl } = await this._runOrchestration(userMessage, chat, wantsAudio);

      const finalResponse = await prisma.$transaction(async (tx) => {
        return await this._finalWrite(tx, { userMessage, text, precis, fallbackUsed, audioUrl, chatId: chat.id, userId });
      });

      // --- Non-blocking call to update summary ---
      this._updateRollingSummaryIfNeeded(chat.id).catch(err => {
        console.error(`Background summary update failed for chat ${chat.id}:`, err.message);
      });
      // ----------------------------------------

      finalResponse.chatId = chat.id.toString();
      return finalResponse;

    } catch (error) {

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return this._getExistingResponse(idempotencyKey, userId);
      }
      console.error(`Critical error in PromptOrchestrator for user ${userId}:`, error.message);
      if (userMessage) {
        await this._handleFailure(userMessage, error);
      }
      throw error;
    }
  }

  async _getExistingResponse(idempotencyKey, userId) {
    const userMessage = await prisma.message.findUnique({
      where: { idempotencyKey },
    });

    if (userMessage) {
      if (userMessage.status === 'PROCESSING') {
        //so we think of implementing a websocket to push the result once ready
        return new Response(null, null, null, "Your previous request is still being processed.", userMessage.chatId);
      }

      const assistantMessage = await prisma.message.findFirst({
        where: {
          chatId: userMessage.chatId,
          role: 'assistant',
          createdAt: { gt: userMessage.createdAt }
        },
        orderBy: { createdAt: 'asc' }
      });

      if (assistantMessage) {
        return new Response(
          assistantMessage.content,
          assistantMessage.audioUrl,
          assistantMessage.fallbackUsed,
          null,
          assistantMessage.chatId.toString()
        );
      }
    }
    return null;
  }

  async _initialWrite(tx, { question, userId, idempotencyKey, chatId }) {
    const chat = await this._findOrCreateChat(tx, userId, chatId, question);
    const userMessage = await tx.message.create({
      data: {
        chatId: chat.id,
        role: 'user',
        content: question,
        idempotencyKey,
        status: 'PROCESSING',
      },
    });
    return { userMessage, chat };
  }

  async _runOrchestration(userMessage, chat, wantsAudio) {
    const question = userMessage.content;
    if (!question) {
      return { text: "Sorry, I didn’t understand your request.", precis: null, fallbackUsed: true, audioUrl: null };
    }
    const history = await prisma.message.findMany({
      where: {
        chatId: chat.id,
        id: { not: userMessage.id },
      },
      orderBy: { createdAt: 'asc' },
      take: 20, // Limit to the last 20 messages for now
    });

    // 2. Build context string from history
    const historyText = history.map(msg => {
      if (msg.role === 'assistant') {
        return `assistant: ${msg.precis || msg.content}`;
      }
      return `user: ${msg.content}`;
    }).join('\n');
    const category = await categorizer.categorize(question);
    const refinedPromptForCurrentQuestion = templateEngine.buildPrompt(category, question);

    const finalPrompt = `
      ${chat.summary || ''}

      Recent History:
      ${historyText}

      New Question:
      ${refinedPromptForCurrentQuestion}
    `;

    console.log("🛠️ Final Prompt with History:", finalPrompt);

    await prisma.message.update({
      where: { id: userMessage.id },
      data: { refinedPrompt: finalPrompt },
    });

    // 5. Generate text (which now includes a precis)
    const { text, precis, fallbackUsed } = await llmProvider.generateText(finalPrompt);
    const audioUrl = wantsAudio ? await this._synthesizeAudioGracefully(text, userMessage.id) : null;

    return { text, precis, fallbackUsed, audioUrl };
  }

  async _finalWrite(tx, { userMessage, text, precis, fallbackUsed, audioUrl, chatId, userId }) {
    const assistantMessage = await tx.message.create({
      data: {
        chatId: chatId,
        role: 'assistant',
        content: text,
        precis: precis, // Save the precis
        audioUrl,
        fallbackUsed,
        status: 'COMPLETED',
      },
    });

    await tx.message.update({
      where: { id: userMessage.id },
      data: { status: 'COMPLETED' },
    });

    // Convert BigInts to strings for serialization
    const serializableMessage = {
        ...assistantMessage,
        id: assistantMessage.id.toString(),
        chatId: assistantMessage.chatId.toString(),
    };

    // Send the new message over WebSocket
    webSocketManager.sendMessageToUser(userId.toString(), {
      type: 'new_message',
      payload: serializableMessage,
    });

    console.log("✅ Finalized and sent message via WebSocket for userMessage ID:", assistantMessage.id);
    return new Response(
      assistantMessage.content,
      assistantMessage.audioUrl,
      assistantMessage.fallbackUsed,
      null,
      assistantMessage.chatId.toString()
    );
  }

  async _handleFailure(userMessage, error) {
    await prisma.message.update({
      where: { id: userMessage.id },
      data: { status: 'FAILED' },
    });
    await this._logFailure(error, userMessage.id);
  }

  async _findOrCreateChat(tx, userId, chatId, question) {
    if (chatId) {
      const chat = await tx.chat.findUnique({
        where: { id: chatId },
        include: { messages: false }, // Summary is on the chat model itself
      });
      if (chat && chat.userId === userId) return chat;
    }
    // If we are creating a new chat, send a websocket message
    const newChat = await tx.chat.create({
      data: {
        userId: userId,
        title: question.substring(0, 40),
        summary: 'This chat is about: ' + question.substring(0, 100),
      },
    });

    // Convert BigInts to strings for serialization
    const serializableChat = {
        ...newChat,
        id: newChat.id.toString(),
        userId: newChat.userId.toString(),
    };

    webSocketManager.sendMessageToUser(userId.toString(), {
      type: 'new_chat',
      payload: serializableChat,
    });

    return newChat;
  }

  async _logFailure(error, userMessageId) {
    let failureType = 'PROMPT_ORCHESTRATION';
    if (error instanceof LLMError) {
      failureType = 'LLM_PRIMARY';
    } else if (error instanceof TTSError) {
      failureType = 'TTS_SERVICE';
    }

    await prisma.failureLog.create({
      data: {
        messageId: userMessageId,
        failureType: failureType,
        errorMessage: error.message,
        errorCode: error.statusCode ? String(error.statusCode) : null,
      },
    });
  }

  async _synthesizeAudioGracefully(text, userMessageId) {
    try {
      return await ttsService.synthesize(text);
    } catch (ttsError) {
      await this._logFailure(ttsError, userMessageId);
      return null;
    }
  }

  async _updateRollingSummaryIfNeeded(chatId) {
    const messageCount = await prisma.message.count({ where: { chatId } });

    if (messageCount > 0 && messageCount % SUMMARY_INTERVAL === 0) {
      console.log(`📈 Triggering summary update for chat ${chatId} at ${messageCount} messages.`);

      const chat = await prisma.chat.findUnique({ where: { id: chatId } });
      if (!chat) return;

      const messagesToSummarize = await prisma.message.findMany({
        where: {
          chatId: chatId,
          // A more robust implementation would fetch messages since the last summary.
          // For now, we fetch the last `SUMMARY_INTERVAL` messages.
        },
        orderBy: { createdAt: 'desc' },
        take: SUMMARY_INTERVAL,
      });

      const recentHistoryText = messagesToSummarize.reverse().map(msg => {
        if (msg.role === 'assistant') {
          return `assistant: ${msg.precis || msg.content}`;
        }
        return `user: ${msg.content}`;
      }).join('\n');

      const summaryPrompt = `
        You are a conversation summarizer. Here is the existing summary of the conversation:
        ---
        ${chat.summary || 'No summary yet.'}
        ---
        
        Here are the most recent messages:
        ---
        ${recentHistoryText}
        ---

        Please create a new, updated summary that incorporates the new information.
      `;

      const newSummary = await llmProvider.generateSummary(summaryPrompt);

      await prisma.chat.update({
        where: { id: chatId },
        data: { summary: newSummary },
      });

      console.log(`✅ Successfully updated summary for chat ${chatId}.`);
    }
  }
}

const promptOrchestrator = new PromptOrchestrator();
export default promptOrchestrator;