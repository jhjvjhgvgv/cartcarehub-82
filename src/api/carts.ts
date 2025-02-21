
import { Cart } from "@/types/cart"
import { supabase } from "@/integrations/supabase/client"
import { Database } from "@/types/supabase"

type Tables = Database['public']['Tables']
type CartRow = Tables['carts']['Row']
type CartInsert = Tables['carts']['Insert']
type CartUpdate = Tables['carts']['Update']

// Fetch carts from Supabase
export const fetchCarts = async (): Promise<Cart[]> => {
  const { data, error } = await supabase
    .from("carts")
    .select("*") as { data: CartRow[] | null; error: Error | null }

  if (error) throw new Error(error.message)
  return data || []
}

// Update a cart in Supabase
export const updateCart = async (cart: Cart): Promise<Cart> => {
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

  if (error) throw new Error(error.message)
  if (!data) throw new Error("Failed to update cart")
  return data as Cart
}

// Create a new cart in Supabase
export const createCart = async (cart: Omit<Cart, "id">): Promise<Cart> => {
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

  if (error) throw new Error(error.message)
  if (!data) throw new Error("Failed to create cart")
  return data as Cart
}

// Delete a cart from Supabase
export const deleteCart = async (cartId: string): Promise<void> => {
  const { error } = await supabase
    .from("carts")
    .delete()
    .eq("id", cartId)

  if (error) throw new Error(error.message)
}
