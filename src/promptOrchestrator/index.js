import prisma from '../database/client.js';
import categorizer from '../categorizer/index.js';
import templateEngine from '../templateEngine/index.js';
import llmProvider from '../llmProvider/index.js';
import ttsService from '../ttsService/index.js';
import Response from '../models/Response.js';
import ErrorHandler from '../utils/ErrorHandler.js';

class PromptOrchestrator {
  async handleQuestion({ question, wantsAudio, userId, idempotencyKey }) {


    const existingQuestion = await prisma.qUESTIONS.findUnique({
      where: { idempotency_key: idempotencyKey },
      include: { response: true },
    });

    if (existingQuestion) {
      console.log('Idempotency key found, returning existing response.');
      if (!existingQuestion.response.length) {

        throw new ErrorHandler('Duplicate request processing, but no response found. Please try again with a new request.', 409);
      }
      const existingResponse = existingQuestion.response[0];
      return new Response(
        existingResponse.text_answer,
        existingResponse.audio_url,
        existingQuestion.fallback_used === 1,
        null
      );
    }
    let questionRecord;
    try {
      questionRecord = await prisma.qUESTIONS.create({
        data: {
          user_id: userId,
          raw_query: question,
          idempotency_key: idempotencyKey,
          status: 'PENDING',
        },
      });

      const category = await categorizer.categorize(question);
      const prompt = templateEngine.buildPrompt(category, question);

      await prisma.qUESTIONS.update({
        where: { question_ID: questionRecord.question_ID },
        data: { refined_prompt: prompt },
      });

      const { text, fallbackUsed } = await llmProvider.generateText(prompt);

      let audioUrl = null;
      let ttsFailed = 0;
      if (wantsAudio) {
        try {
          audioUrl = await ttsService.synthesize(text);
        } catch (ttsError) {
          console.error('TTS Service failed:', ttsError);
          ttsFailed = 1;
        }
      }

      await prisma.response.create({
        data: {
          question_id: questionRecord.question_ID,
          text_answer: text,
          audio_url: audioUrl,
          tts_failed: ttsFailed,
        },
      });

      await prisma.qUESTIONS.update({
        where: { question_ID: questionRecord.question_ID },
        data: {
          status: 'COMPLETED',
          fallback_used: fallbackUsed ? 1 : 0,
        },
      });

      return new Response(text, audioUrl, fallbackUsed, null);

    } catch (error) {
      console.error('Error in PromptOrchestrator:', error);
      if (questionRecord) {
        await prisma.qUESTIONS.update({
          where: { question_ID: questionRecord.question_ID },
          data: {
            status: 'FAILED',
            error_message: error.message,
          },
        });
      }
      throw error;
    }
  }
}

const promptOrchestrator = new PromptOrchestrator();
export default promptOrchestrator;