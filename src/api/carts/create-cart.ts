
import { Cart } from "@/types/cart"
import { supabase } from "@/integrations/supabase/client"
import { mapToCart } from "@/api/mappers/cart-mapper"
import { retryOperation } from "@/api/utils/retry-operations"
import { handleCartApiError } from "@/api/utils/cart-error-handler"

// Create a new cart in Supabase
export const createCart = async (cart: Omit<Cart, "id">): Promise<Cart> => {
  try {
    const cartData = {
      qr_code: cart.qr_code,
      store: cart.store,
      store_id: cart.storeId, // Use storeId for store_id
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
