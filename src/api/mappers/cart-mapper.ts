import type { Tables } from "@/integrations/supabase/types";

type CartRow = Tables<"carts">;

export interface MappedCart {
  id: string;
  asset_tag: string | null;
  qr_token: string;
  status: 'in_service' | 'out_of_service' | 'retired';
  model: string | null;
  notes: string | null;
  store_org_id: string;
  created_at: string;
  updated_at: string;
}

export const mapToCart = (row: CartRow): MappedCart => ({
  id: row.id,
  asset_tag: row.asset_tag,
  qr_token: row.qr_token,
  status: row.status,
  model: row.model,
  notes: row.notes,
  store_org_id: row.store_org_id,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export const mapToCartRow = (cart: Partial<MappedCart>): Partial<CartRow> => ({
  asset_tag: cart.asset_tag,
  qr_token: cart.qr_token,
  status: cart.status,
  model: cart.model,
  notes: cart.notes,
  store_org_id: cart.store_org_id,
});
