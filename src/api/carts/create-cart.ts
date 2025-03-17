
import { Cart } from "@/types/cart"
import { supabase } from "@/integrations/supabase/client"
import { mapToCart, mapToCartRow } from "@/api/mappers/cart-mapper"
import { retryOperation } from "@/api/utils/retry-operations"
import { handleCartApiError } from "@/api/utils/cart-error-handler"
import { generateUniqueQRCode } from "@/utils/qr-generator"

// Create a new cart in Supabase
export const createCart = async (cart: Omit<Cart, "id">): Promise<Cart> => {
  try {
    // Use mapper to ensure all required fields are present
    const cartData = mapToCartRow(cart);
    
    // Generate a unique QR code if not provided
    if (!cartData.qr_code) {
      cartData.qr_code = generateUniqueQRCode();
    }
    
    // Ensure last_maintenance is never null (required by database constraint)
    if (!cartData.last_maintenance) {
      cartData.last_maintenance = new Date().toISOString();
    }
    
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
