
import { Cart } from "@/types/cart"
import { managedStores } from "@/constants/stores"

export const prepareMultipleCartEdit = (selectedCarts: Cart[]): Cart => {
  const commonValues = {
    status: selectedCarts.every(cart => cart.status === selectedCarts[0].status) 
      ? selectedCarts[0].status 
      : "active",
    store: selectedCarts.every(cart => cart.store === selectedCarts[0].store)
      ? selectedCarts[0].store
      : "",
    lastMaintenance: selectedCarts.every(cart => cart.lastMaintenance === selectedCarts[0].lastMaintenance)
      ? selectedCarts[0].lastMaintenance
      : "",
    issues: selectedCarts.every(cart => cart.issues.join(",") === selectedCarts[0].issues.join(","))
      ? selectedCarts[0].issues
      : [],
  }

  const store = managedStores.find(s => s.name === commonValues.store)
  return {
    id: selectedCarts.map(cart => cart.id).join(","),
    qr_code: "Multiple Carts",
    storeId: store?.id || "",
    store_id: store?.id || "", // Added store_id
    ...commonValues,
    originalCarts: selectedCarts,
  }
}

export const filterCarts = (
  carts: Cart[], 
  filters: { rfidTag: string; status: string; store: string }
) => {
  return carts.filter((cart) => {
    const isInManagedStore = managedStores.some(store => store.id === cart.storeId)
    const matchRfidTag = cart.qr_code.toLowerCase().includes(filters.rfidTag.toLowerCase())
    const matchStatus = !filters.status || cart.status === filters.status
    const matchStore = !filters.store || cart.store === filters.store
    return isInManagedStore && matchRfidTag && matchStatus && matchStore
  })
}
