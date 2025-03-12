
import { Cart } from "@/types/cart"
import { supabase } from "@/integrations/supabase/client"
import { mapToCart, mapToCartRow } from "../mappers/cart-mapper"
import { retryOperation } from "../utils/retry-utils"
import { handleCartApiError } from "../utils/error-handler"

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
    // Convert Cart to database row format
    const cartData = mapToCartRow(cart);
    
    console.log("Updating cart with data:", cartData);
    
    const { data, error } = await retryOperation(async () => 
      supabase
        .from('carts')
        .update(cartData)
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
    // Convert Cart to database row format
    const cartData = mapToCartRow(cart);
    
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
