
import { Cart } from "@/types/cart"
import { supabase } from "@/integrations/supabase/client"
import { mapToCart } from "@/api/mappers/cart-mapper"
import { retryOperation } from "@/api/utils/retry-operations"
import { handleCartApiError } from "@/api/utils/cart-error-handler"

// Update a cart in Supabase
export const updateCart = async (cart: Cart): Promise<Cart> => {
  try {
    // Use snake_case for the database field name
    const lastMaintenance = cart.lastMaintenance || cart.last_maintenance || new Date().toISOString();
    
    console.log("Updating cart with data:", {
      qr_code: cart.qr_code,
      store: cart.store,
      store_id: cart.storeId, // Use storeId for store_id
      status: cart.status,
      last_maintenance: lastMaintenance, // Use snake_case
      issues: cart.issues,
      maintenance_history: cart.maintenance_history,
    });

    const { data, error } = await retryOperation(async () => 
      supabase
        .from('carts')
        .update({
          qr_code: cart.qr_code,
          store: cart.store,
          store_id: cart.storeId, // Use storeId for store_id
          status: cart.status,
          last_maintenance: lastMaintenance, // Use snake_case
          issues: cart.issues,
          maintenance_history: cart.maintenance_history || [],
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
