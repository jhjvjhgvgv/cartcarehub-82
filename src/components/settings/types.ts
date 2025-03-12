
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

export interface InvitationFormProps {
  isMaintenance: boolean
  invitations: Invitation[]
  setInvitations: React.Dispatch<React.SetStateAction<Invitation[]>>
}

export interface InvitationErrorProps {
  errorMessage: string | null
  errorDetails: string | null
}

export interface InvitationConfirmationProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  email?: string
}

export interface ManagedStore {
  id: string
  name: string
  address?: string
  status: "active" | "inactive" | "pending"
  createdAt: string
  managerId?: string // Store manager ID who owns this store
}

export interface StoreMaintenanceConnection {
  storeId: string
  maintenanceId: string
  status: "active" | "pending" | "rejected"
  connectedAt?: string
}

export interface StoreManagerSummary {
  totalStores: number
  activeStores: number
  totalMaintenanceProviders: number
  pendingConnections: number
}
