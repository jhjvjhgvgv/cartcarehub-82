export interface Cart {
  id: string
  rfidTag: string
  store: string
  storeId: string
  status: "active" | "maintenance" | "retired"
  lastMaintenance: string
  issues: string[]
  originalCarts?: Cart[] // Add this optional property for multiple cart editing
}