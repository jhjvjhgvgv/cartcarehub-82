
export interface Cart {
  id: string
  qr_code: string // Change from rfidTag to qr_code to match database column
  store: string
  storeId: string
  status: "active" | "maintenance" | "retired"
  lastMaintenance?: string // Keep this optional
  issues: string[]
  originalCarts?: Cart[] // Keep this optional property for multiple cart editing
}
