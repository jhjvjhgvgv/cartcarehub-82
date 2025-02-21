
import { Cart } from "./cart"

export interface CartMutationParams {
  data: any
  editingCart: Cart | null
  managedStores: Array<{ id: string; name: string }>
}
