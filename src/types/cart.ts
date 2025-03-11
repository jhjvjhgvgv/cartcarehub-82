
export interface Cart {
  id: string
  qr_code: string
  store: string
  storeId: string // We'll keep this for backward compatibility with the UI
  store_id: string // Added this to match the database schema
  status: "active" | "maintenance" | "retired"
  lastMaintenance?: string
  issues: string[]
  originalCarts?: Cart[]
}
