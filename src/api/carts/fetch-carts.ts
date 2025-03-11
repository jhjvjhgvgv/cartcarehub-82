
import { Cart } from "@/types/cart"
import { supabase } from "@/integrations/supabase/client"
import { mapToCart } from "@/api/mappers/cart-mapper"
import { retryOperation } from "@/api/utils/retry-operations"
import { handleCartApiError } from "@/api/utils/cart-error-handler"

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
