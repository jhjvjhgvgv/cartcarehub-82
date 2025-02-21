
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
import { filterCarts, prepareMultipleCartEdit } from "@/utils/cartUtils"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const Carts = () => {
  const { carts, isLoading, error, handleSubmit, handleDeleteCart } = useCarts()
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
    handleSubmit({ data, editingCart, managedStores })
    handleDialogClose(false)
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load carts"}
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        <CartHeader onAddClick={() => setIsAddDialogOpen(true)} />
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
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
          </>
        )}

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
