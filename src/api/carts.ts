
import { Cart } from "@/types/cart"
import { supabase } from "@/integrations/supabase/client"
import { Database } from "@/types/supabase"

type Tables = Database['public']['Tables']
type CartRow = Tables['carts']['Row']
type CartInsert = Tables['carts']['Insert']
type CartUpdate = Tables['carts']['Update']

// Fetch carts from Supabase
export const fetchCarts = async (): Promise<Cart[]> => {
  try {
    const { data, error } = await supabase
      .from("carts")
      .select("*") as { data: CartRow[] | null; error: Error | null }

    if (error) throw error
    return data || []
  } catch (error: any) {
    console.error('Error fetching carts:', error);
    if (error.message?.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.')
    }
    throw error
  }
}

// Update a cart in Supabase
export const updateCart = async (cart: Cart): Promise<Cart> => {
  try {
    const updateData: CartUpdate = {
      rfidTag: cart.rfidTag,
      store: cart.store,
      storeId: cart.storeId,
      status: cart.status,
      lastMaintenance: cart.lastMaintenance,
      issues: cart.issues,
    }

    const { data, error } = await supabase
      .from("carts")
      .update(updateData)
      .eq("id", cart.id)
      .select()
      .single() as { data: CartRow | null; error: Error | null }

    if (error) throw error
    if (!data) throw new Error("Failed to update cart")
    return data as Cart
  } catch (error: any) {
    console.error('Error updating cart:', error);
    if (error.message?.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.')
    }
    throw error
  }
}

// Create a new cart in Supabase
export const createCart = async (cart: Omit<Cart, "id">): Promise<Cart> => {
  try {
    const insertData: CartInsert = {
      rfidTag: cart.rfidTag,
      store: cart.store,
      storeId: cart.storeId,
      status: cart.status,
      lastMaintenance: cart.lastMaintenance,
      issues: cart.issues,
    }

    const { data, error } = await supabase
      .from("carts")
      .insert([insertData])
      .select()
      .single() as { data: CartRow | null; error: Error | null }

    if (error) throw error
    if (!data) throw new Error("Failed to create cart")
    return data as Cart
  } catch (error: any) {
    console.error('Error creating cart:', error);
    if (error.message?.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.')
    }
    throw error
  }
}

// Delete a cart from Supabase
export const deleteCart = async (cartId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("carts")
      .delete()
      .eq("id", cartId)

    if (error) throw error
  } catch (error: any) {
    console.error('Error deleting cart:', error);
    if (error.message?.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.')
    }
    throw error
  }
}
