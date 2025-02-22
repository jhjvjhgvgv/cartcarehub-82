
import { Cart } from "@/types/cart"
import { supabase } from "@/integrations/supabase/client"
import { Database } from "@/types/supabase"

type Tables = Database['public']['Tables']
type CartRow = Tables['carts']['Row']
type CartInsert = Tables['carts']['Insert']
type CartUpdate = Tables['carts']['Update']

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> => {
  try {
    return await operation()
  } catch (error: any) {
    if (retries > 0 && error.message?.includes('Failed to fetch')) {
      await wait(RETRY_DELAY)
      return retryOperation(operation, retries - 1)
    }
    throw error
  }
}

// Fetch carts from Supabase
export const fetchCarts = async (): Promise<CartRow[]> => {
  try {
    const { data, error } = await retryOperation(async () => 
      supabase
        .from('carts')
        .select('*')
    )

    if (error) throw error
    return data ?? []
  } catch (error: any) {
    console.error('Error fetching carts:', error)
    if (error.message?.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.')
    }
    throw error
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
    if (error.message?.includes('Failed to fetch')) {
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
    if (error.message?.includes('Failed to fetch')) {
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
    if (error.message?.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.')
    }
    throw error
  }
}
