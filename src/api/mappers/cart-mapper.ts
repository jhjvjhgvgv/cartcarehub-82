import type { Tables } from "@/integrations/supabase/types";
import type { Cart } from "@/types/cart";

type CartRow = Tables<"carts">;

// The mapper is now a passthrough since Cart === CartRow
export const mapToCart = (row: CartRow): Cart => row;

export const mapToCartRow = (cart: Partial<Cart>): Partial<CartRow> => cart;
