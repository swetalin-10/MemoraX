/**
 * Safe AI Logging Utility
 * Logs metadata about AI generation without logging sensitive user content.
 */

export const logAITaskStart = (taskType, model, estTokens) => {
  console.log(`[AI Router] ⏳ Queuing task: ${taskType} | model=${model} | estTokens=${estTokens}`);
};

export const logAITaskExecution = (taskType, model) => {
  console.log(`[AI Router] ▶️ Starting task: ${taskType} | model=${model}`);
};

export const logAITaskSuccess = (taskType, model, durationMs, retries) => {
  const retryStr = retries > 0 ? ` | retries=${retries}` : "";
  console.log(`[AI Router] ✓ SUCCESS ${taskType} | model=${model} | ${durationMs}ms${retryStr}`);
};

export const logAIRetry = (taskType, attempt, maxRetries, delay, errorMsg) => {
  console.warn(
    `[AI Router] ⟳ Retry ${attempt}/${maxRetries} for ${taskType} | waiting ${delay}ms | error: ${errorMsg?.substring(0, 100)}`
  );
};

export const logAITaskFailure = (taskType, model, durationMs, retries, logType, errorMsg) => {
  console.error(
    `[AI Router] ✗ ${logType} ${taskType} | model=${model} | ${durationMs}ms | retries=${retries} | error: ${errorMsg?.substring(0, 150)}`
  );
};
