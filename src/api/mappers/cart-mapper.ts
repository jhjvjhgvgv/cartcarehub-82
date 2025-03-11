
import { Cart } from "@/types/cart"
import { Database } from "@/types/supabase"

type Tables = Database['public']['Tables']
type CartRow = Tables['carts']['Row']

// Convert from database row to application Cart
export const mapToCart = (row: CartRow): Cart => ({
  id: row.id,
  qr_code: row.qr_code,
  store: row.store,
  storeId: row.store, // Use store as storeId since storeId doesn't exist in the database
  status: row.status,
  lastMaintenance: row.lastMaintenance || "",
  issues: row.issues,
})
