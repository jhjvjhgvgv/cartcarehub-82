export interface Cart {
  id: string
  rfidTag: string
  store: string
  storeId: string
  status: "active" | "maintenance" | "retired"
  lastMaintenance: string
  issues: string[]
}