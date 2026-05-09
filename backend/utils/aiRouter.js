/**
 * AI Router — Centralized AI Generation Layer
 *
 * All AI generation in MemoraX flows through this single module.
 * It provides:
 * 1. Task-based model selection (via aiModels.js config)
 * 2. Exponential backoff retry for 429/503 errors
 * 3. Token safety — validates prompt length before sending
 * 4. Structured logging — task type, model, duration, retries
 * 5. Consistent error handling
 *
 * Usage:
 *   import { generateAIContent, AI_TASK } from "../utils/aiRouter.js";
 *   const result = await generateAIContent({
 *     taskType: AI_TASK.FLASHCARDS,
 *     prompt: "Generate flashcards from...",
 *   });
 *   console.log(result.text);
 */

import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import pLimit from "p-limit";
import { getModelForTask, TOKEN_LIMITS, RETRY_CONFIG, AI_TASK } from "../config/aiModels.js";

dotenv.config();

// ─── Singleton AI Client ─────────────────────────────────────────────────────

if (!process.env.GEMINI_API_KEY) {
  console.error("FATAL ERROR: GEMINI_API_KEY is not defined in environment variables");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ─── Concurrency Limiter ─────────────────────────────────────────────────────

// Restrict to max 2 concurrent AI generations globally to prevent quota spikes
const limit = pLimit(2);

// ─── Token Estimation ────────────────────────────────────────────────────────

/**
 * Rough token estimation (1 token ≈ 4 characters for English text).
 * Used for pre-flight validation, not billing.
 * @param {string} text
 * @returns {number} Estimated token count
 */
const estimateTokens = (text) => {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
};

/**
 * Truncate prompt to fit within the safe token limit for a task.
 * Preserves the beginning (instructions) and truncates the content portion.
 * @param {string} prompt - Full prompt text
 * @param {string} taskType - Task type for limit lookup
 * @returns {string} Potentially truncated prompt
 */
const enforceTokenLimit = (prompt, taskType) => {
  const limit = TOKEN_LIMITS[taskType] || 16000;
  const estimatedTokens = estimateTokens(prompt);

  if (estimatedTokens <= limit) {
    return prompt;
  }

  // Truncate to approximately the safe character limit
  const safeCharLimit = limit * 4;
  const truncated = prompt.substring(0, safeCharLimit);

  console.warn(
    `[AI Router] Prompt truncated for ${taskType}: ${estimatedTokens} est. tokens → ~${limit} tokens`
  );

  return truncated;
};

// ─── Retry with Exponential Backoff ──────────────────────────────────────────

/**
 * Sleep for a given number of milliseconds.
 * @param {number} ms
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Determine if an error is retryable (transient server error or timeout).
 * Explicitly DO NOT retry quota or rate limits.
 * @param {Error} error
 * @returns {boolean}
 */
const isRetryableError = (error) => {
  const message = error?.message?.toLowerCase() || "";
  const status = error?.status || error?.statusCode || 0;

  // STRICTLY DO NOT RETRY QUOTA ERRORS
  if (
    status === 429 ||
    message.includes("429") ||
    message.includes("resource_exhausted") ||
    message.includes("rate limit") ||
    message.includes("quota") ||
    message.includes("overloaded") ||
    message.includes("api key")
  ) {
    return false;
  }

  // Check for retryable status codes
  if (RETRY_CONFIG.retryableStatusCodes.includes(status)) return true;

  // Retry 503 Service Unavailable, timeout, network errors
  if (
    message.includes("503") ||
    message.includes("500") ||
    message.includes("timeout") ||
    message.includes("econnreset")
  ) {
    return true;
  }

  return false;
};

// ─── Main Generation Function ────────────────────────────────────────────────

/**
 * Generate AI content through the centralized router.
 *
 * @param {Object} params
 * @param {string} params.taskType - One of AI_TASK constants (e.g., AI_TASK.FLASHCARDS)
 * @param {string} params.prompt - The full prompt to send
 * @param {Object} [params.options] - Additional options (reserved for future use)
 * @returns {Promise<{ text: string, usage: { model: string, taskType: string, durationMs: number, retries: number } }>}
 */
export const generateAIContent = async ({ taskType, prompt, options = {} }) => {
  const model = getModelForTask(taskType);
  const safePropmt = enforceTokenLimit(prompt, taskType);
  const estimatedTokens = estimateTokens(safePropmt);

  console.log(`[AI Router] ⏳ Queuing task: ${taskType} | model=${model} | estTokens=${estimatedTokens}`);

  return limit(async () => {
    const startTime = Date.now();
    let lastError = null;
    let retries = 0;

    console.log(`[AI Router] ▶️ Starting task: ${taskType} | model=${model}`);

    for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: safePropmt,
        });

        const text =
          response?.candidates?.[0]?.content?.parts?.[0]?.text ||
          response?.text ||
          "";

        const durationMs = Date.now() - startTime;

        // Success log
        console.log(
          `[AI Router] ✓ SUCCESS ${taskType} | model=${model} | ${durationMs}ms${retries > 0 ? ` | retries=${retries}` : ""}`
        );

        return {
          text,
          usage: {
            model,
            taskType,
            durationMs,
            retries,
          },
        };
      } catch (error) {
        lastError = error;
        retries = attempt;

        if (attempt < RETRY_CONFIG.maxRetries && isRetryableError(error)) {
          const delay = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt);
          console.warn(
            `[AI Router] ⟳ Retry ${attempt + 1}/${RETRY_CONFIG.maxRetries} for ${taskType} | waiting ${delay}ms | error: ${error.message?.substring(0, 100)}`
          );
          await sleep(delay);
        } else {
          // Non-retryable error or max retries exhausted
          break;
        }
      }
    }

    // All retries exhausted or non-retryable error hit
    const durationMs = Date.now() - startTime;
    const errorMsg = lastError?.message?.toLowerCase() || "";
    
    let safeErrorMessage = "AI service temporarily unavailable. Please try again later.";
    let logType = "FAILED";

    if (errorMsg.includes("429") || errorMsg.includes("resource_exhausted") || errorMsg.includes("quota")) {
      safeErrorMessage = "AI quota exceeded. Please try again later.";
      logType = "QUOTA_EXHAUSTED";
    }

    console.error(
      `[AI Router] ✗ ${logType} ${taskType} | model=${model} | ${durationMs}ms | retries=${retries} | error: ${lastError?.message?.substring(0, 150)}`
    );

    // Throw a clean error so controllers return safe messages to frontend
    throw new Error(safeErrorMessage);
  });
};

// Re-export task types for convenience
export { AI_TASK } from "../config/aiModels.js";
