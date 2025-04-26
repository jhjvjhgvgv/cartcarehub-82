
export interface ManagedStore {
  id: string;
  name: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
  address?: string;
  updatedAt?: string;
}

export interface StoreFormData {
  name: string;
  address: string;
  status: "active" | "inactive" | "pending";
}
