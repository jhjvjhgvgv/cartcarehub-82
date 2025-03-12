
import { Cart } from "@/types/cart"
import { Database } from "@/integrations/supabase/types"

type CartRow = Database['public']['Tables']['carts']['Row']
type CartStatus = "active" | "maintenance" | "retired"

// Convert from database row to application Cart
export const mapToCart = (row: CartRow): Cart => ({
  id: row.id,
  qr_code: row.qr_code,
  store: row.store,
  storeId: row.store_id, // Map the database store_id to our UI's storeId
  store_id: row.store_id, // Include store_id directly
  status: validateCartStatus(row.status),
  lastMaintenance: row.last_maintenance || "", // Map from snake_case to camelCase
  last_maintenance: row.last_maintenance || "", // Keep original field for direct DB operations
  issues: row.issues,
})

// Convert from Cart to database insert/update object
export const mapToCartRow = (cart: Omit<Cart, "id">): Omit<CartRow, "id" | "created_at" | "updated_at"> => ({
  qr_code: cart.qr_code,
  store: cart.store,
  store_id: cart.storeId, // Map storeId to store_id
  status: cart.status,
  last_maintenance: cart.lastMaintenance || cart.last_maintenance || new Date().toISOString(), // Use either one, ensuring it's never null
  issues: cart.issues,
})

// Helper function to validate and convert string status to our enum type
function validateCartStatus(status: string): CartStatus {
  if (status === "active" || status === "maintenance" || status === "retired") {
    return status;
  }
  // Default to active if an invalid status is provided
  console.warn(`Invalid cart status: ${status}, defaulting to "active"`);
  return "active";
}
