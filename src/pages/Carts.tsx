
import { useState } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { CartStats } from "@/components/carts/CartStats"
import { CartDialog } from "@/components/carts/CartDialog"
import { CartHeader } from "@/components/carts/CartHeader"
import { CartListSection } from "@/components/carts/CartListSection"
import { useCarts } from "@/hooks/use-carts"
import { Cart } from "@/types/cart"
import { CartFilters as CartFiltersType } from "@/components/cart-filters"
import { managedStores } from "@/constants/stores"
import { initialCartsData } from "@/data/initialCarts"
import { filterCarts, prepareMultipleCartEdit } from "@/utils/cartUtils"

const Carts = () => {
  const { carts, handleSubmit, handleDeleteCart } = useCarts(initialCartsData)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCart, setEditingCart] = useState<Cart | null>(null)
  const [filters, setFilters] = useState<CartFiltersType>({
    rfidTag: "",
    status: "",
    store: "",
  })

  const filteredCarts = filterCarts(carts, filters)
  const activeCarts = filteredCarts.filter((cart) => cart.status === "active").length
  const maintenanceNeeded = filteredCarts.filter((cart) => cart.status === "maintenance").length

  const handleEditMultiple = (selectedCarts: Cart[]) => {
    setEditingCart(prepareMultipleCartEdit(selectedCarts))
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
