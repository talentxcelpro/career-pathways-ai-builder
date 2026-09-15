// src/agents/kernel/RetryEngine.ts
// Exponential Backoff with Jitter & Max Retries

export class KernelRetryEngine {
  static async execute<T>(
    operation: () => Promise<T>,
    options: { maxRetries?: number; baseDelayMs?: number; opName?: string } = {}
  ): Promise<T> {
    const maxRetries = options.maxRetries ?? 3;
    const baseDelayMs = options.baseDelayMs ?? 400;
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (err) {
        lastError = err;
        if (attempt === maxRetries) break;
        const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 150;
        await new Promise((res) => setTimeout(res, delay));
      }
    }
    throw lastError;
  }
}
