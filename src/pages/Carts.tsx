import { useState } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { CartStats } from "@/components/carts/CartStats"
import { CartDialog } from "@/components/carts/CartDialog"
import { CartHeader } from "@/components/carts/CartHeader"
import { CartListSection } from "@/components/carts/CartListSection"
import { useCarts } from "@/hooks/use-carts"
import { Cart } from "@/types/cart"
import { CartFilters as CartFiltersType } from "@/components/cart-filters"

const managedStores = [
  { id: "store1", name: "SuperMart Downtown" },
  { id: "store2", name: "FreshMart Heights" },
]

const initialCarts: Cart[] = [
  {
    id: "CART-001",
    rfidTag: "RFID-A123",
    store: "SuperMart Downtown",
    storeId: "store1",
    status: "active",
    lastMaintenance: "2024-02-15",
    issues: ["Wheel alignment needed"],
  },
  {
    id: "CART-002",
    rfidTag: "RFID-B456",
    store: "SuperMart Downtown",
    storeId: "store1",
    status: "maintenance",
    lastMaintenance: "2024-01-20",
    issues: ["Handle loose", "Left wheel damaged"],
  },
  {
    id: "CART-003",
    rfidTag: "RFID-C789",
    store: "FreshMart Heights",
    storeId: "store2",
    status: "active",
    lastMaintenance: "2024-02-10",
    issues: [],
  },
]

const Carts = () => {
  const { carts, handleSubmit, handleDeleteCart } = useCarts(initialCarts)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCart, setEditingCart] = useState<Cart | null>(null)
  const [filters, setFilters] = useState<CartFiltersType>({
    rfidTag: "",
    status: "",
    store: "",
  })

  const filteredCarts = carts.filter((cart) => {
    const isInManagedStore = managedStores.some(store => store.id === cart.storeId)
    const matchRfidTag = cart.rfidTag.toLowerCase().includes(filters.rfidTag.toLowerCase())
    const matchStatus = !filters.status || cart.status === filters.status
    const matchStore = !filters.store || cart.store === filters.store
    return isInManagedStore && matchRfidTag && matchStatus && matchStore
  })

  const activeCarts = filteredCarts.filter((cart) => cart.status === "active").length
  const maintenanceNeeded = filteredCarts.filter((cart) => cart.status === "maintenance").length

  const handleEditMultiple = (selectedCarts: Cart[]) => {
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
    setEditingCart({
      id: selectedCarts.map(cart => cart.id).join(","),
      rfidTag: "Multiple Carts",
      storeId: store?.id || "",
      ...commonValues,
    } as Cart)
    setIsAddDialogOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        <CartHeader onAddClick={() => setIsAddDialogOpen(true)} />
        <CartStats
          totalCarts={filteredCarts.length}
          activeCarts={activeCarts}
          maintenanceNeeded={maintenanceNeeded}
        />
        <CartListSection
          filteredCarts={filteredCarts}
          onEditCart={setEditingCart}
          onDeleteCart={handleDeleteCart}
          onEditMultiple={handleEditMultiple}
          onFilterChange={setFilters}
          managedStores={managedStores}
        />

        <CartDialog
          isOpen={isAddDialogOpen || !!editingCart}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) setEditingCart(null)
          }}
          onSubmit={(data) => handleSubmit(data, editingCart, managedStores)}
          editingCart={editingCart}
          managedStores={managedStores}
        />
      </div>
    </DashboardLayout>
  )
}

export default Carts