import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { v4 as uuidv4 } from 'uuid';

type CartInsert = TablesInsert<"carts">;
type CartRow = Tables<"carts">;

export const createCart = async (
  cartData: Omit<CartInsert, "id" | "created_at" | "updated_at">
): Promise<CartRow> => {
  const dataToInsert = {
    ...cartData,
    qr_token: cartData.qr_token || uuidv4(),
  };

  const { data, error } = await supabase
    .from("carts")
    .insert(dataToInsert)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error("Failed to create cart");
  return data;
};
