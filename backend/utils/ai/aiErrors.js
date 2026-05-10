import { RETRY_CONFIG } from "./aiModels.js";

/**
 * Determine if an error is retryable (transient server error or timeout).
 * Explicitly DO NOT retry quota or rate limits.
 * @param {Error} error
 * @returns {boolean}
 */
export const isRetryableError = (error) => {
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

  // Check for retryable status codes (e.g., 500, 503)
  if (RETRY_CONFIG.retryableStatusCodes.includes(status)) return true;

  // Retry 503 Service Unavailable, timeout, network errors
  if (
    message.includes("503") ||
    message.includes("500") ||
    message.includes("timeout") ||
    message.includes("econnreset") ||
    message.includes("fetch failed")
  ) {
    return true;
  }

  return false;
};

/**
 * Safely extract and format an AI error for client consumption.
 * @param {Error} error 
 * @returns {{ safeMessage: string, logType: string }}
 */
export const formatAIError = (error) => {
  const message = error?.message?.toLowerCase() || "";
  
  if (message.includes("429") || message.includes("resource_exhausted") || message.includes("quota")) {
    return {
      safeMessage: "AI quota exceeded. Please try again later.",
      logType: "QUOTA_EXHAUSTED",
    };
  }

  if (message.includes("api key")) {
    return {
      safeMessage: "AI configuration error.",
      logType: "INVALID_API_KEY",
    };
  }

  return {
    safeMessage: "AI service temporarily unavailable. Please try again later.",
    logType: "FAILED",
  };
};
