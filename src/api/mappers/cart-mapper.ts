
import { Cart } from "@/types/cart"
import { Database } from "@/types/supabase"

type Tables = Database['public']['Tables']
type CartRow = Tables['carts']['Row']

// Convert from database row to application Cart
export const mapToCart = (row: CartRow): Cart => ({
  id: row.id,
  qr_code: row.rfidTag, // Map rfidTag from DB to qr_code for our app
  store: row.store,
  storeId: row.storeId,
  status: row.status,
  lastMaintenance: row.lastMaintenance || "",
  issues: row.issues,
})
