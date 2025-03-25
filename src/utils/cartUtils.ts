
import { Cart } from "@/types/cart"
import { managedStores } from "@/constants/stores"
import { CartFilters } from "@/components/cart-filters"

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
  filters: CartFilters
) => {
  return carts.filter((cart) => {
    const isInManagedStore = managedStores.some(store => store.id === cart.storeId)
    const matchRfidTag = cart.qr_code.toLowerCase().includes(filters.rfidTag.toLowerCase())
    const matchStatus = !filters.status || cart.status === filters.status
    const matchStore = !filters.store || cart.store === filters.store
    
    // Check date range if specified
    let matchDateRange = true
    if (filters.dateRange && filters.dateRange.from) {
      const maintenanceDate = cart.lastMaintenance ? new Date(cart.lastMaintenance) : null
      
      if (maintenanceDate) {
        // Set time to midnight for accurate date comparison
        const fromDate = new Date(filters.dateRange.from)
        fromDate.setHours(0, 0, 0, 0)
        
        // If only from date is set
        if (!filters.dateRange.to) {
          matchDateRange = maintenanceDate >= fromDate
        } 
        // If both from and to dates are set
        else {
          const toDate = new Date(filters.dateRange.to)
          toDate.setHours(23, 59, 59, 999) // End of day
          matchDateRange = maintenanceDate >= fromDate && maintenanceDate <= toDate
        }
      } else {
        // If cart has no maintenance date and filter is set, exclude it
        matchDateRange = false
      }
    }
    
    return isInManagedStore && matchRfidTag && matchStatus && matchStore && matchDateRange
  })
}
