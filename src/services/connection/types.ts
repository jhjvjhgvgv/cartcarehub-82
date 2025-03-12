
// Connection-related type definitions
export interface StoreAccount {
  id: string;
  name: string;
  type?: "store";
}

export interface MaintenanceAccount {
  id: string;
  name: string;
  type?: "maintenance";
}

export interface UserAccount extends StoreAccount, MaintenanceAccount {
  type: "store" | "maintenance";
}

export interface StoreConnection {
  id: string;
  storeId: string;
  maintenanceId: string;
  status: "pending" | "active" | "rejected";
  requestedAt: string;
  connectedAt?: string;
}
