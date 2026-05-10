import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { RETRY_CONFIG, getModelForTask } from "./aiModels.js";
import { isRetryableError, formatAIError } from "./aiErrors.js";
import { logAITaskStart, logAITaskExecution, logAITaskSuccess, logAIRetry, logAITaskFailure } from "./aiLogger.js";
import { enforceTokenLimit, estimateTokens } from "./aiLimiter.js";
import { aiQueue } from "./aiQueue.js";
import { createStandardResponse } from "./aiResponseFormatter.js";

dotenv.config();

// ─── Singleton AI Client ─────────────────────────────────────────────────────

if (!process.env.GEMINI_API_KEY) {
  console.error("FATAL ERROR: GEMINI_API_KEY is not defined in environment variables");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ─── Utility ─────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Main Generation Router ──────────────────────────────────────────────────

/**
 * Generate AI content through the centralized router.
 *
 * @param {Object} params
 * @param {string} params.taskType - One of AI_TASK constants (e.g., AI_TASK.FLASHCARDS)
 * @param {string} params.prompt - The full prompt to send
 * @param {Object} [params.options] - Additional options (reserved for future use)
 * @returns {Promise<{ success: boolean, content: string, text: string, usage: { model: string, taskType: string, durationMs: number, retries: number } }>}
 */
export const generateAIResponse = async ({ taskType, prompt, options = {} }) => {
  const model = getModelForTask(taskType);
  const safePrompt = enforceTokenLimit(prompt, taskType);
  const estimatedTokens = estimateTokens(safePrompt);

  logAITaskStart(taskType, model, estimatedTokens);

  return aiQueue(async () => {
    const startTime = Date.now();
    let lastError = null;
    let retries = 0;

    logAITaskExecution(taskType, model);

    for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: safePrompt,
        });

        const text =
          response?.candidates?.[0]?.content?.parts?.[0]?.text ||
          response?.text ||
          "";

        const durationMs = Date.now() - startTime;

        logAITaskSuccess(taskType, model, durationMs, retries);

        const usageMetadata = { model, taskType, durationMs, retries };
        return createStandardResponse(text, usageMetadata);
      } catch (error) {
        lastError = error;
        retries = attempt;

        if (attempt < RETRY_CONFIG.maxRetries && isRetryableError(error)) {
          const delay = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt);
          logAIRetry(taskType, attempt + 1, RETRY_CONFIG.maxRetries, delay, error.message);
          await sleep(delay);
        } else {
          // Non-retryable error or max retries exhausted
          break;
        }
      }
    }

    // All retries exhausted or non-retryable error hit
    const durationMs = Date.now() - startTime;
    const { safeMessage, logType } = formatAIError(lastError);

    logAITaskFailure(taskType, model, durationMs, retries, logType, lastError?.message);

    // Throw a clean error so controllers return safe messages to frontend
    throw new Error(safeMessage);
  });
};
