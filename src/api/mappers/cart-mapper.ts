
import { Cart } from "@/types/cart"
import { Database } from "@/types/supabase"

type Tables = Database['public']['Tables']
type CartRow = Tables['carts']['Row']

// Convert from database row to application Cart
export const mapToCart = (row: CartRow): Cart => ({
  id: row.id,
  qr_code: row.qr_code, // Updated to use qr_code instead of rfidTag
  store: row.store,
  storeId: row.storeId,
  status: row.status,
  lastMaintenance: row.lastMaintenance || "",
  issues: row.issues,
})
