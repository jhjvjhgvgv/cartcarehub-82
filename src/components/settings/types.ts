
export type Invitation = {
  email: string
  type: "store" | "maintenance"
  status: "pending" | "accepted" | "sent"
  sentAt: string
}

export interface StoreMaintenanceManagerProps {
  isMaintenance: boolean
}
