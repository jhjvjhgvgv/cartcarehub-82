import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import DashboardLayout from "@/components/DashboardLayout"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { CartForm } from "@/components/cart-form"
import { CartFilters, type CartFilters as CartFiltersType } from "@/components/cart-filters"
import { useToast } from "@/hooks/use-toast"
import { CartList, type Cart } from "@/components/carts/CartList"
import { CartStats } from "@/components/carts/CartStats"

// Mock data for managed stores (this would come from your auth/backend)
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
  })
  const { toast } = useToast()

  // Filter carts based on managed stores and user filters
  const filteredCarts = carts.filter((cart) => {
    const isInManagedStore = managedStores.some(store => store.id === cart.storeId)
    const matchRfidTag = cart.rfidTag.toLowerCase().includes(filters.rfidTag.toLowerCase())
    const matchStatus = !filters.status || cart.status === filters.status
    return isInManagedStore && matchRfidTag && matchStatus
  })

  const activeCarts = filteredCarts.filter((cart) => cart.status === "active").length
  const maintenanceNeeded = filteredCarts.filter((cart) => cart.status === "maintenance").length

  const handleAddCart = (data: any) => {
    const store = managedStores.find(s => s.name === data.store)
    if (!store) {
      toast({
        title: "Error",
        description: "Selected store is not in your managed stores list.",
        variant: "destructive",
      })
      return
    }

    const newCart: Cart = {
      id: `CART-${String(carts.length + 1).padStart(3, "0")}`,
      rfidTag: data.rfidTag,
      store: data.store,
      storeId: store.id,
      status: data.status,
      lastMaintenance: data.lastMaintenance,
      issues: data.issues ? [data.issues] : [],
    }
    setCarts([...carts, newCart])
    setIsAddDialogOpen(false)
    toast({
      title: "Cart Added",
      description: "New cart has been successfully added to the system.",
    })
  }

  const handleEditCart = (data: any) => {
    if (!editingCart) return
    const store = managedStores.find(s => s.name === data.store)
    if (!store) {
      toast({
        title: "Error",
        description: "Selected store is not in your managed stores list.",
        variant: "destructive",
      })
      return
    }

    const updatedCarts = carts.map((cart) =>
      cart.id === editingCart.id
        ? {
            ...cart,
            rfidTag: data.rfidTag,
            store: data.store,
            storeId: store.id,
            status: data.status,
            lastMaintenance: data.lastMaintenance,
            issues: data.issues ? [data.issues] : [],
          }
        : cart
    )
    setCarts(updatedCarts)
    setEditingCart(null)
    toast({
      title: "Cart Updated",
      description: "Cart details have been successfully updated.",
    })
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
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Cart Management</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Add New Cart
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogTitle>Add New Cart</DialogTitle>
              <CartForm
                onSubmit={handleAddCart}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <CartStats
          totalCarts={filteredCarts.length}
          activeCarts={activeCarts}
          maintenanceNeeded={maintenanceNeeded}
        />

        <Card>
          <CardHeader>
            <CardTitle>All Carts</CardTitle>
            <CartFilters onFilterChange={setFilters} />
          </CardHeader>
          <CardContent>
            <CartList
              carts={filteredCarts}
              onEditCart={setEditingCart}
              onDeleteCart={handleDeleteCart}
            />
          </CardContent>
        </Card>

        {editingCart && (
          <Dialog open={!!editingCart} onOpenChange={() => setEditingCart(null)}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogTitle>Edit Cart</DialogTitle>
              <CartForm
                initialData={{
                  rfidTag: editingCart.rfidTag,
                  store: editingCart.store,
                  status: editingCart.status,
                  lastMaintenance: editingCart.lastMaintenance,
                  issues: editingCart.issues.join("\n"),
                }}
                onSubmit={handleEditCart}
                onCancel={() => setEditingCart(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Carts