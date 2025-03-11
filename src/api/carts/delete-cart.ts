
import { supabase } from "@/integrations/supabase/client"
import { retryOperation } from "@/api/utils/retry-operations"
import { handleCartApiError } from "@/api/utils/cart-error-handler"

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
