import prisma from '../database/client.js';
import categorizer from '../categorizer/index.js';
import templateEngine from '../templateEngine/index.js';
import llmProvider from '../llmProvider/index.js';
import ttsService from '../ttsService/index.js';
import Response from '../models/Response.js';
import ConflictError from '../utils/errors/ConflictError.js';
import DatabaseError from '../utils/errors/DatabaseError.js';
import LLMError from '../utils/errors/LLMError.js';
import TTSError from '../utils/errors/TTSError.js';

class PromptOrchestrator {
  async handleQuestion({ question, wantsAudio, userId, idempotencyKey, chatId = null }) {
    const existingMessage = await prisma.message.findUnique({
      where: { idempotencyKey },
    });

    if (existingMessage) {
      throw new ConflictError('This request has already been processed.');
    }

    let userMessage;

    try {

      const chat = await this._findOrCreateChat(userId, chatId, question);
      chatId = chat.id;


      userMessage = await prisma.message.create({
        data: {
          chatId: chatId,
          role: 'user',
          content: question,
          idempotencyKey,
        },
      });


      const category = await categorizer.categorize(question);
      const refinedPrompt = templateEngine.buildPrompt(category, question);


      await prisma.message.update({
        where: { id: userMessage.id },
        data: { refinedPrompt },
      });

      const { text, fallbackUsed } = await llmProvider.generateText(refinedPrompt);

      let audioUrl = wantsAudio ? await this._synthesizeAudioGracefully(text, userMessage.id) : null;

      const assistantMessage = await prisma.message.create({
        data: {
          chatId: chatId,
          role: 'assistant',
          content: text,
          audioUrl,
          fallbackUsed,
        },
      });

      // Step 5: Return the successful response.
      return new Response(
        assistantMessage.content,
        assistantMessage.audioUrl,
        assistantMessage.fallbackUsed,
        null,
        chatId
      );
    } catch (error) {
      console.error(`Critical error in PromptOrchestrator for user ${userId}:`, error.message);


      if (userMessage && userMessage.id) {
        await this._logFailure(error, userMessage.id);
      }

      // Re-throw the original, structured error for the global middleware to handle.
      throw error;
    }
  }

  /**
   * A private helper to find an existing chat or create a new one.
   */
  async _findOrCreateChat(userId, chatId, question) {
    if (chatId) {
      const chat = await prisma.chat.findUnique({ where: { id: chatId } });
      // Optional: Check if chat belongs to the user.
      if (chat && chat.userId === userId) return chat;
    }
    return prisma.chat.create({
      data: {
        userId,
        title: question.substring(0, 40),
      },
    });
  }
  async _logFailure(error, userMessageId) {
    if (!userMessageId) {
      console.error("Cannot log failure: userMessageId was not provided.");
      return;
    }

    let failureType = 'PROMPT_ORCHESTRATION'; // Default type

    if (error instanceof LLMError) {
      failureType = 'LLM_PRIMARY'; // Or a more general 'LLM'
    } else if (error instanceof TTSError) {
      failureType = 'TTS_SERVICE';
    }

    try {
      await prisma.failureLog.create({
        data: {
          messageId: userMessageId,
          failureType: failureType,
          errorMessage: error.message,
          errorCode: error.statusCode ? String(error.statusCode) : null,
        },
      });
    } catch (logError) {
      console.error("CRITICAL: Failed to write to FailureLog.", logError);
    }
  }

  async _synthesizeAudioGracefully(text, userMessageId) {
    try {
      const audioUrl = await ttsService.synthesize(text);
      return audioUrl;
    } catch (ttsError) {
      await this._logFailure(ttsError, userMessageId);
      return null
    }
  }
}

const promptOrchestrator = new PromptOrchestrator();
export default promptOrchestrator;