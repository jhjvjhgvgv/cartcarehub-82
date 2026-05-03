import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { normalizeAssetTag } from "@/components/cart-form/types";

type CartInsert = TablesInsert<"carts">;
type CartRow = Tables<"carts">;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const QR_TOKEN_REGEX = /^[A-Z0-9-]{6,}$/;

export const createCart = async (
  cartData: Omit<CartInsert, "id" | "created_at" | "updated_at">
): Promise<CartRow> => {
  // Hard validation – never let auto-generated UUIDs or empty tokens through.
  const token = cartData.qr_token?.trim();
  if (!token) {
    throw new Error(
      "QR token is required. Scan the physical sticker or enter the token manually."
    );
  }
  if (UUID_REGEX.test(token)) {
    throw new Error(
      "Auto-generated UUIDs are not accepted as QR tokens. Use a real cart QR."
    );
  }
  if (!QR_TOKEN_REGEX.test(token)) {
    throw new Error(
      "QR token must match ^[A-Z0-9-]{6,}$ (uppercase letters, digits, hyphens)."
    );
  }
  if (!cartData.store_org_id) {
    throw new Error("store_org_id (organization UUID) is required.");
  }

  const dataToInsert: CartInsert = {
    ...cartData,
    qr_token: token,
    asset_tag: normalizeAssetTag(cartData.asset_tag ?? null),
  };

  const { data, error } = await supabase
    .from("carts")
    .insert(dataToInsert)
    .select()
    .single();

  if (error) {
    // Surface the unique-violation in a friendly way.
    if (error.code === "23505") {
      throw new Error("A cart with this QR token already exists.");
    }
    throw error;
  }
  if (!data) throw new Error("Failed to create cart");
  return data;
};
