
import { useState, useEffect } from "react"
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
  { id: "store3", name: "Value Grocery West" },
]

const initialCarts: Cart[] = [
  {
    id: "CART-001",
    rfidTag: "QR-123456789",
    store: "SuperMart Downtown",
    storeId: "store1",
    status: "active",
    lastMaintenance: "2024-02-15",
    issues: ["Wheel alignment needed"],
  },
  {
    id: "CART-002",
    rfidTag: "QR-987654321",
    store: "SuperMart Downtown",
    storeId: "store1",
    status: "maintenance",
    lastMaintenance: "2024-01-20",
    issues: ["Handle loose", "Left wheel damaged"],
  },
  {
    id: "CART-003",
    rfidTag: "QR-456789123",
    store: "FreshMart Heights",
    storeId: "store2",
    status: "active",
    lastMaintenance: "2024-02-10",
    issues: [],
  },
  {
    id: "CART-004",
    rfidTag: "QR-789123456",
    store: "FreshMart Heights",
    storeId: "store2",
    status: "retired",
    lastMaintenance: "2024-01-05",
    issues: ["Frame damage", "Beyond repair"],
  },
  {
    id: "CART-005",
    rfidTag: "QR-321654987",
    store: "Value Grocery West",
    storeId: "store3",
    status: "active",
    lastMaintenance: "2024-02-20",
    issues: [],
  },
  {
    id: "CART-006",
    rfidTag: "QR-654987321",
    store: "Value Grocery West",
    storeId: "store3",
    status: "maintenance",
    lastMaintenance: "2024-02-01",
    issues: ["Squeaky wheel"],
  },
  {
    id: "CART-007",
    rfidTag: "QR-147258369",
    store: "SuperMart Downtown",
    storeId: "store1",
    status: "active",
    lastMaintenance: "2024-02-18",
    issues: [],
  },
  {
    id: "CART-008",
    rfidTag: "QR-258369147",
    store: "FreshMart Heights",
    storeId: "store2",
    status: "active",
    lastMaintenance: "2024-02-17",
    issues: [],
  },
  {
    id: "CART-009",
    rfidTag: "QR-369147258",
    store: "Value Grocery West",
    storeId: "store3",
    status: "active",
    lastMaintenance: "2024-02-19",
    issues: [],
  },
]

const Carts = () => {
  const [localCarts, setLocalCarts] = useState<Cart[]>(initialCarts)
  const { carts, handleSubmit, handleDeleteCart } = useCarts(localCarts)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCart, setEditingCart] = useState<Cart | null>(null)
  const [filters, setFilters] = useState<CartFiltersType>({
    rfidTag: "",
    status: "",
    store: "",
  })

  useEffect(() => {
    console.log('Local carts updated:', localCarts)
  }, [localCarts])

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
      originalCarts: selectedCarts,
    } as Cart)
    setIsAddDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setIsAddDialogOpen(open)
    if (!open) {
      setEditingCart(null)
    }
  }

  const handleSubmitDialog = (data: any) => {
    handleSubmit(data, editingCart, managedStores)
    handleDialogClose(false)
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
          onOpenChange={handleDialogClose}
          onSubmit={handleSubmitDialog}
          onDelete={handleDeleteCart}
          editingCart={editingCart}
          managedStores={managedStores}
        />
      </div>
    </DashboardLayout>
  )
}

export default Carts
