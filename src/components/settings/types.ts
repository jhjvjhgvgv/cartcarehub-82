
export type Invitation = {
  email: string
  type: "store" | "maintenance"
  status: "pending" | "accepted" | "sent"
  sentAt: string
}

export interface StoreMaintenanceManagerProps {
  isMaintenance: boolean
}

export interface Store {
  id: string
  name: string
  status: "active" | "inactive" | "pending"
  connectedSince: string
}

export interface StoreConnection {
  id: string
  storeId: string
  maintenanceId: string
  status: "pending" | "active" | "rejected"
  requestedAt: string
  connectedAt?: string
}
