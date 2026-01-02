import { Cart, CartWithPrediction } from "@/types/cart";
import { supabase } from "@/integrations/supabase/client";
import { retryOperation } from "@/api/utils/retry-operations";
import { handleCartApiError } from "@/api/utils/cart-error-handler";

// Fetch basic carts from Supabase (carts table only)
export const fetchCarts = async (): Promise<Cart[]> => {
  try {
    console.log("Attempting to fetch carts...");
    const { data, error } = await retryOperation(async () =>
      supabase.from("carts").select("*")
    );

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} carts`);
    return data ?? [];
  } catch (error: any) {
    throw handleCartApiError(error, "fetching");
  }
};

// Fetch carts with predictions from the carts_with_predictions view
export const fetchCartsWithPredictions = async (storeOrgId?: string): Promise<CartWithPrediction[]> => {
  try {
    console.log("Fetching carts with predictions...");
    let query = supabase
      .from("carts_with_predictions")
      .select("*");
    
    if (storeOrgId) {
      query = query.eq("store_org_id", storeOrgId);
    }

    const { data, error } = await retryOperation(async () => query);

    if (error) {
      console.error("Supabase error fetching predictions:", error);
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} carts with predictions`);
    return (data ?? []) as CartWithPrediction[];
  } catch (error: any) {
    throw handleCartApiError(error, "fetching predictions");
  }
};

// Fetch enriched carts (with store info) from carts_enriched view
export const fetchCartsEnriched = async (storeOrgId?: string): Promise<CartWithPrediction[]> => {
  try {
    console.log("Fetching enriched carts...");
    let query = supabase
      .from("carts_enriched")
      .select("*");
    
    if (storeOrgId) {
      query = query.eq("store_org_id", storeOrgId);
    }

    const { data, error } = await retryOperation(async () => query);

    if (error) {
      console.error("Supabase error fetching enriched carts:", error);
      throw error;
    }

    // Map to CartWithPrediction format (enriched doesn't have predictions)
    return (data ?? []).map(cart => ({
      ...cart,
      maintenance_probability: null,
      days_until_maintenance: null
    })) as CartWithPrediction[];
  } catch (error: any) {
    throw handleCartApiError(error, "fetching enriched carts");
  }
};
