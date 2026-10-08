/** Retries a request with exponential backoff before giving up. */
export async function withRetry<T>(
  run: () => Promise<T>,
  { attempts, delayMs }: { attempts: number; delayMs: number }
) {
  let lastError: unknown

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await run()
    } catch (error) {
      lastError = error
      await new Promise((resolve) => setTimeout(resolve, delayMs * 2 ** attempt))
    }
  }

  throw lastError
}
