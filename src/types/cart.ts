
export interface Cart {
  id: string
  qr_code: string
  store: string
  storeId: string // We'll keep this for backward compatibility with the UI
  store_id: string // For direct database matches
  status: "active" | "maintenance" | "retired"
  lastMaintenance?: string // Keep camelCase in our app code for consistency
  last_maintenance?: string // Added to match the database field
  issues: string[]
  originalCarts?: Cart[]
  maintenancePrediction?: {
    probability: number
    daysUntilMaintenance: number
    lastCalculated: string
  }
  maintenance_history?: Array<{
    date: string;
    description: string;
  }>
}
