
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

// Instead of extending both interfaces with conflicting types,
// create a union type for UserAccount
export interface UserAccount {
  id: string;
  name: string;
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
