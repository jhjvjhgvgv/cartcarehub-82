
// Handle and enhance error messages for cart operations
export const handleCartApiError = (error: any, operation: string): Error => {
  console.error(`Error ${operation} cart:`, error)
  
  if (error.message?.includes('Failed to fetch') || error.message?.includes('timed out')) {
    return new Error('Unable to connect to the server. Please check your internet connection and try again.')
  } else if (error.code === 'PGRST301') {
    return new Error('Database error: Table not found. Please contact support.')
  } else if (error.code === '20000') {
    return new Error('Authentication error: Not authorized to access this resource.')
  } else if (error.code === '22P02') {
    return new Error('Database error: Invalid input. Please contact support.')
  } else if (error.code === 'PGRST204') {
    return new Error('Database error: Column not found. Database schema might have changed.')
  }
  
  // For other types of errors
  return new Error(`Server error: ${error.message || `Unknown error occurred during ${operation}`}`)
}
