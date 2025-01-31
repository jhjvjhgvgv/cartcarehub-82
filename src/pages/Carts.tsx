import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import DashboardLayout from "@/components/DashboardLayout"
import { CartFilters, type CartFilters as CartFiltersType } from "@/components/cart-filters"
import { useToast } from "@/hooks/use-toast"
import { CartList } from "@/components/carts/CartList"
import { CartStats } from "@/components/carts/CartStats"
import { CartDialog } from "@/components/carts/CartDialog"
import { CartHeader } from "@/components/carts/CartHeader"
import { Cart } from "@/types/cart"

const managedStores = [
  { id: "store1", name: "SuperMart Downtown" },
  { id: "store2", name: "FreshMart Heights" },
]

const Carts = () => {
  const [carts, setCarts] = useState<Cart[]>([
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
  ])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCart, setEditingCart] = useState<Cart | null>(null)
  const [filters, setFilters] = useState<CartFiltersType>({
    rfidTag: "",
    status: "",
    store: "",
  })
  const { toast } = useToast()

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
        : "",
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

  const handleAddCart = (data: any) => {
    const store = managedStores.find(s => s.name === data.store)
    if (!store) return

    const newCart: Cart = {
      id: `CART-${String(carts.length + 1).padStart(3, "0")}`,
      rfidTag: data.rfidTag,
      store: data.store,
      storeId: store.id,
      status: data.status,
      lastMaintenance: data.lastMaintenance,
      issues: data.issues ? data.issues.split('\n') : [],
    }
    setCarts([...carts, newCart])
    setIsAddDialogOpen(false)
    toast({
      title: "Cart Added",
      description: "New cart has been successfully added to the system.",
    })
  }

  const handleSubmit = (data: any) => {
    if (editingCart) {
      if (editingCart.id.includes(",")) {
        // Handling bulk edit
        const cartIds = editingCart.id.split(",")
        const updatedCarts = carts.map(cart => {
          if (cartIds.includes(cart.id)) {
            const store = managedStores.find(s => s.name === data.store)
            return {
              ...cart,
              status: data.status || cart.status,
              store: data.store || cart.store,
              storeId: store?.id || cart.storeId,
              lastMaintenance: data.lastMaintenance || cart.lastMaintenance,
              issues: data.issues ? data.issues.split('\n') : cart.issues,
            }
          }
          return cart
        })
        setCarts(updatedCarts)
        toast({
          title: "Carts Updated",
          description: `Successfully updated ${cartIds.length} carts.`,
        })
      } else {
        const store = managedStores.find(s => s.name === data.store)
        if (!store) return

        const updatedCarts = carts.map((cart) =>
          cart.id === editingCart.id
            ? {
                ...cart,
                rfidTag: data.rfidTag,
                store: data.store,
                storeId: store.id,
                status: data.status,
                lastMaintenance: data.lastMaintenance,
                issues: data.issues ? data.issues.split('\n') : [],
              }
            : cart
        )
        setCarts(updatedCarts)
        toast({
          title: "Cart Updated",
          description: "Cart details have been successfully updated.",
        })
      }
    } else {
      handleAddCart(data)
    }
    setIsAddDialogOpen(false)
    setEditingCart(null)
  }

  const handleDeleteCart = (cartId: string) => {
    setCarts(carts.filter((cart) => cart.id !== cartId))
    toast({
      title: "Cart Deleted",
      description: "Cart has been successfully removed from the system.",
      variant: "destructive",
    })
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
        <Card>
          <CardHeader>
            <CardTitle>All Carts</CardTitle>
            <CartFilters onFilterChange={setFilters} managedStores={managedStores} />
          </CardHeader>
          <CardContent>
            <CartList
              carts={filteredCarts}
              onEditCart={setEditingCart}
              onDeleteCart={handleDeleteCart}
              onEditMultiple={handleEditMultiple}
            />
          </CardContent>
        </Card>

        <CartDialog
          isOpen={isAddDialogOpen || !!editingCart}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) setEditingCart(null)
          }}
          onSubmit={handleSubmit}
          editingCart={editingCart}
          managedStores={managedStores}
        />
      </div>
    </DashboardLayout>
  )
}

export default Carts