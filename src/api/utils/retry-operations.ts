
// Constants for retry logic
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second
const REQUEST_TIMEOUT = 10000 // 10 seconds

// Helper function to add a delay
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Add timeout to fetch operations
export const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Request timed out after ${ms}ms`))
    }, ms)
    
    promise.then(
      (result) => {
        clearTimeout(timeoutId)
        resolve(result)
      },
      (error) => {
        clearTimeout(timeoutId)
        reject(error)
      }
    )
  })
}

// Retry operation with exponential backoff
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> => {
  try {
    return await withTimeout(operation(), REQUEST_TIMEOUT)
  } catch (error: any) {
    console.error("Operation failed:", error.message)
    
    if (retries > 0 && (
      error.message?.includes('Failed to fetch') || 
      error.message?.includes('timed out') ||
      error.message?.includes('network') ||
      error.code === 'ECONNREFUSED' ||
      error.status === 503 || // Service Unavailable
      error.status === 504 // Gateway Timeout
    )) {
      console.log(`Retrying operation. Attempts remaining: ${retries-1}`)
      await wait(delay)
      return retryOperation(operation, retries - 1, delay * 1.5) // Exponential backoff
    }
    throw error
  }
}
