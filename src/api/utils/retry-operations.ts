
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

// Retry operation with exponential backoff and circuit breaker pattern
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> => {
  try {
    return await withTimeout(operation(), REQUEST_TIMEOUT)
  } catch (error: any) {
    console.error("Operation failed:", error.message)
    
    // Check for connection errors that should be retried
    const shouldRetry = retries > 0 && (
      error.message?.includes('Failed to fetch') || 
      error.message?.includes('timed out') ||
      error.message?.includes('network') ||
      error.code === 'ECONNREFUSED' ||
      error.status === 503 || // Service Unavailable
      error.status === 504 // Gateway Timeout
    );
    
    // Add circuit breaker pattern - don't retry if too many failures
    if (shouldRetry) {
      // Store retry count in sessionStorage to track across page loads
      const key = 'supabase_retry_count';
      const currentCount = Number(sessionStorage.getItem(key) || '0');
      
      if (currentCount >= 5) {
        // Too many retries, circuit is open
        console.warn("Circuit breaker activated - too many connection failures");
        sessionStorage.setItem(key, '0'); // Reset for next session
        throw new Error("Service unavailable: Too many connection attempts failed");
      }
      
      // Increment retry counter
      sessionStorage.setItem(key, String(currentCount + 1));
      
      console.log(`Retrying operation. Attempts remaining: ${retries-1}`);
      await wait(delay);
      return retryOperation(operation, retries - 1, delay * 1.5); // Exponential backoff
    }
    
    throw error;
  }
}
