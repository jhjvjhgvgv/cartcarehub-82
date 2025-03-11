
import { Cart } from "@/types/cart"
import { supabase } from "@/integrations/supabase/client"
import { Database } from "@/types/supabase"

type Tables = Database['public']['Tables']
type CartRow = Tables['carts']['Row']
type CartInsert = Tables['carts']['Insert']
type CartUpdate = Tables['carts']['Update']

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second
const REQUEST_TIMEOUT = 8000 // 8 seconds

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

const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> => {
  try {
    return await withTimeout(operation(), REQUEST_TIMEOUT)
  } catch (error: any) {
    console.log("Operation failed:", error.message)
    
    if (retries > 0 && (
      error.message?.includes('Failed to fetch') || 
      error.message?.includes('timed out') ||
      error.message?.includes('network') ||
      error.status === 503 || // Service Unavailable
      error.status === 504 // Gateway Timeout
    )) {
      console.log(`Retrying operation. Attempts remaining: ${retries-1}`)
      await wait(RETRY_DELAY)
      return retryOperation(operation, retries - 1)
    }
    throw error
  }
}

// Fetch carts from Supabase
export const fetchCarts = async (): Promise<CartRow[]> => {
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
    return data ?? []
  } catch (error: any) {
    console.error('Error fetching carts:', error)
    
    // Enhanced error handling with more specific error messages
    if (error.message?.includes('Failed to fetch') || error.message?.includes('timed out')) {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.')
    } else if (error.code === 'PGRST301') {
      throw new Error('Database error: Table not found. Please contact support.')
    } else if (error.code === '20000') {
      throw new Error('Authentication error: Not authorized to access this resource.')
    } else if (error.code === '22P02') {
      throw new Error('Database error: Invalid input. Please contact support.')
    }
    
    // For other types of errors
    throw new Error(`Server error: ${error.message || 'Unknown error occurred'}`)
  }
}

// Update a cart in Supabase
export const updateCart = async (cart: Cart): Promise<CartRow> => {
  try {
    const { data, error } = await retryOperation(async () => 
      supabase
        .from('carts')
        .update({
          rfidTag: cart.rfidTag,
          store: cart.store,
          storeId: cart.storeId,
          status: cart.status,
          lastMaintenance: cart.lastMaintenance,
          issues: cart.issues
        })
        .eq('id', cart.id)
        .select()
        .single()
    )

    if (error) throw error
    if (!data) throw new Error("Failed to update cart")
    return data
  } catch (error: any) {
    console.error('Error updating cart:', error)
    if (error.message?.includes('Failed to fetch') || error.message?.includes('timed out')) {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.')
    }
    throw error
  }
}

// Create a new cart in Supabase
export const createCart = async (cart: Omit<CartRow, "id" | "created_at" | "updated_at">): Promise<CartRow> => {
  try {
    const { data, error } = await retryOperation(async () => 
      supabase
        .from('carts')
        .insert([cart])
        .select()
        .single()
    )

    if (error) throw error
    if (!data) throw new Error("Failed to create cart")
    return data
  } catch (error: any) {
    console.error('Error creating cart:', error)
    if (error.message?.includes('Failed to fetch') || error.message?.includes('timed out')) {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.')
    }
    throw error
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
    console.error('Error deleting cart:', error)
    if (error.message?.includes('Failed to fetch') || error.message?.includes('timed out')) {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.')
    }
    throw error
  }
}
