import prisma from '../database/client.js';
import categorizer from '../categorizer/index.js';
import templateEngine from '../templateEngine/index.js';
import llmProvider from '../llmProvider/index.js';
import ttsService from '../ttsService/index.js';
import Response from '../models/Response.js';
import { Prisma } from '@prisma/client';
import LLMError from '../utils/errors/LLMError.js';
import TTSError from '../utils/errors/TTSError.js';

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

      const { text, fallbackUsed, audioUrl } = await this._runOrchestration(userMessage, wantsAudio);

      const finalResponse = await prisma.$transaction(async (tx) => {
        return await this._finalWrite(tx, { userMessage, text, fallbackUsed, audioUrl, chatId: chat.id });
      });

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
          assistantMessage.chatId
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

  async _runOrchestration(userMessage, wantsAudio) {
    const question = userMessage.question || userMessage.content; // support both
    if (question) {

      return { text: "Sorry, I didn’t understand your request.", fallbackUsed: true, audioUrl: null };
    }

    const category = await categorizer.categorize(question);
    const refinedPrompt = templateEngine.buildPrompt(category, question);

    console.log("🛠️ Refined Prompt:", refinedPrompt);

    await prisma.message.update({
      where: { id: userMessage.id },
      data: { refinedPrompt },
    });

    const { text, fallbackUsed } = await llmProvider.generateText(refinedPrompt);
    const audioUrl = wantsAudio ? await this._synthesizeAudioGracefully(text, userMessage.id) : null;

    return { text, fallbackUsed, audioUrl };
  }

  async _finalWrite(tx, { userMessage, text, fallbackUsed, audioUrl, chatId }) {
    const assistantMessage = await tx.message.create({
      data: {
        chatId: chatId,
        role: 'assistant',
        content: text,
        audioUrl,
        fallbackUsed,
        status: 'COMPLETED',
      },
    });

    await tx.message.update({
      where: { id: userMessage.id },
      data: { status: 'COMPLETED' },
    });

    return new Response(
      assistantMessage.content,
      assistantMessage.audioUrl,
      assistantMessage.fallbackUsed,
      null,
      chatId
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
      const chat = await tx.chat.findUnique({ where: { id: chatId } });
      if (chat && chat.userId === userId) return chat;
    }
    return tx.chat.create({
      data: {
        userId: userId,
        title: question.substring(0, 40),
      },
    });
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
}

const promptOrchestrator = new PromptOrchestrator();
export default promptOrchestrator;