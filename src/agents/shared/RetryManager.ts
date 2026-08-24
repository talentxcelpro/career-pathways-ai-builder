// src/agents/shared/RetryManager.ts
// Exponential Backoff & Fault Tolerance Retry Manager

export class RetryManager {
  /**
   * Executes an asynchronous operation with exponential backoff and jitter
   */
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      baseDelayMs?: number;
      maxDelayMs?: number;
      operationName?: string;
    } = {}
  ): Promise<T> {
    const maxRetries = options.maxRetries ?? 3;
    const baseDelayMs = options.baseDelayMs ?? 500;
    const maxDelayMs = options.maxDelayMs ?? 5000;
    const opName = options.operationName ?? 'anonymous_operation';

    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (err: any) {
        lastError = err;
        if (attempt === maxRetries) {
          break;
        }

        const delay = Math.min(
          maxDelayMs,
          baseDelayMs * Math.pow(2, attempt) + Math.random() * 200
        );

        console.warn(`[RetryManager] ${opName} failed (attempt ${attempt + 1}/${maxRetries}). Retrying in ${Math.round(delay)}ms...`);
        await new Promise((res) => setTimeout(res, delay));
      }
    }

    throw lastError;
  }
}
