
import { Cart } from "@/types/cart"
import { Database } from "@/types/supabase"

type CartRow = Database['public']['Tables']['carts']['Row']

// Convert from database row to application Cart
export const mapToCart = (row: CartRow): Cart => ({
  id: row.id,
  qr_code: row.qr_code,
  store: row.store,
  storeId: row.store_id, // Map the database store_id to our UI's storeId
  store_id: row.store_id, // Include store_id directly
  status: row.status,
  lastMaintenance: row.lastMaintenance || "",
  issues: row.issues,
})

// Convert from Cart to database insert/update object
export const mapToCartRow = (cart: Omit<Cart, "id">): Omit<CartRow, "id"> => ({
  qr_code: cart.qr_code,
  store: cart.store,
  store_id: cart.storeId, // Map storeId to store_id
  status: cart.status,
  lastMaintenance: cart.lastMaintenance || null,
  issues: cart.issues,
})
