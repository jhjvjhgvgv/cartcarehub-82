import { useQuery } from "@tanstack/react-query";
import { Cart } from "@/types/cart";
import { supabase } from "@/integrations/supabase/client";

const fetchCartById = async (cartId: string): Promise<Cart | null> => {
  try {
    console.log(`Fetching cart with ID: ${cartId}`);
    const { data, error } = await supabase
      .from("carts")
      .select("*")
      .eq("id", cartId)
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    if (!data) {
      console.log(`No cart found with ID: ${cartId}`);
      return null;
    }

    console.log(`Successfully fetched cart:`, data);
    return data;
  } catch (error) {
    console.error("Error fetching cart by ID:", error);
    throw error;
  }
};

export const useFetchCartById = (cartId: string | undefined) => {
  return useQuery({
    queryKey: ["cart", cartId],
    queryFn: () => (cartId ? fetchCartById(cartId) : null),
    enabled: !!cartId,
  });
};
