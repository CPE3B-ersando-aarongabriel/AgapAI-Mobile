import { isAxiosError } from "axios";

function shouldRetryGet(error: unknown): boolean {
  if (!isAxiosError(error)) {
    return false;
  }

  if (error.code === "ERR_CANCELED") {
    return false;
  }

  if (!error.response) {
    return true;
  }

  const status = error.response.status;
  return status === 408 || status === 429 || status >= 500;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withGetRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 2,
): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= maxRetries || !shouldRetryGet(error)) {
        throw error;
      }

      const backoff = 250 * Math.pow(2, attempt);
      await sleep(backoff);
      attempt += 1;
    }
  }
}
