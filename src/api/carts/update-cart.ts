import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";

type CartUpdate = TablesUpdate<"carts">;
type CartRow = Tables<"carts">;

export const updateCart = async (
  cartId: string,
  updates: CartUpdate
): Promise<CartRow> => {
  const { data, error } = await supabase
    .from("carts")
    .update(updates)
    .eq("id", cartId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error("Failed to update cart");
  return data;
};
