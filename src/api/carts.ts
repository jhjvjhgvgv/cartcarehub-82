
import { Cart } from "@/types/cart"
import { supabase } from "@/integrations/supabase/client"
import { Database } from "@/types/supabase"

type Tables = Database['public']['Tables']
type CartRow = Tables['carts']['Row']
type CartInsert = Tables['carts']['Insert']
type CartUpdate = Tables['carts']['Update']

// Constants for retry logic
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second
const REQUEST_TIMEOUT = 10000 // 10 seconds

// Helper function to add a delay
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Add timeout to fetch operations
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
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
const retryOperation = async <T>(
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

// Convert from database row to application Cart
const mapToCart = (row: CartRow): Cart => ({
  id: row.id,
  qr_code: row.qr_code, // Updated: use qr_code directly instead of rfidTag
  store: row.store,
  storeId: row.storeId,
  status: row.status,
  lastMaintenance: row.lastMaintenance || "",
  issues: row.issues,
})

// Handle and enhance error messages for cart operations
const handleCartApiError = (error: any, operation: string): Error => {
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

// Fetch carts from Supabase
export const fetchCarts = async (): Promise<Cart[]> => {
  try {
    console.log("Attempting to fetch carts...")
    const { data, error } = await retryOperation(async () => 
      supabase
        .from('carts')
        .select('*')
    )

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    console.log(`Successfully fetched ${data?.length || 0} carts`)
    
    // Map the data to match our Cart type
    return data?.map(mapToCart) ?? []
  } catch (error: any) {
    throw handleCartApiError(error, 'fetching')
  }
}

// Update a cart in Supabase
export const updateCart = async (cart: Cart): Promise<Cart> => {
  try {
    console.log("Updating cart with data:", {
      qr_code: cart.qr_code,
      store: cart.store,
      storeId: cart.storeId,
      status: cart.status,
      issues: cart.issues,
    });

    const { data, error } = await retryOperation(async () => 
      supabase
        .from('carts')
        .update({
          qr_code: cart.qr_code, // Updated: use qr_code directly
          store: cart.store,
          storeId: cart.storeId,
          status: cart.status,
          issues: cart.issues,
        })
        .eq('id', cart.id)
        .select()
        .single()
    )

    if (error) throw error
    if (!data) throw new Error("Failed to update cart")
    return mapToCart(data)
  } catch (error: any) {
    throw handleCartApiError(error, 'updating')
  }
}

// Create a new cart in Supabase
export const createCart = async (cart: Omit<Cart, "id">): Promise<Cart> => {
  try {
    const cartData = {
      qr_code: cart.qr_code, // Updated: use qr_code directly
      store: cart.store,
      storeId: cart.storeId,
      status: cart.status,
      issues: cart.issues,
    };
    
    console.log("Creating cart with data:", cartData);
    
    const { data, error } = await retryOperation(async () => 
      supabase
        .from('carts')
        .insert([cartData])
        .select()
        .single()
    )

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }
    if (!data) throw new Error("Failed to create cart")
    return mapToCart(data)
  } catch (error: any) {
    throw handleCartApiError(error, 'creating')
  }
}

// Delete a cart from Supabase
export const deleteCart = async (cartId: string): Promise<void> => {
  try {
    const { error } = await retryOperation(async () => 
      supabase
        .from('carts')
        .delete()
        .eq('id', cartId)
    )

    if (error) throw error
  } catch (error: any) {
    throw handleCartApiError(error, 'deleting')
  }
}
