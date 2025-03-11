
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
import { AlertCircle, Loader2, WifiOff, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const Carts = () => {
  console.log("Available managed stores:", managedStores)
  const { carts, isLoading, error, isRetrying, retryFetchCarts, handleSubmit, handleDeleteCart } = useCarts()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCart, setEditingCart] = useState<Cart | null>(null)
  const [filters, setFilters] = useState<CartFiltersType>({
    rfidTag: "",
    status: "",
    store: "",
  })

  // Use the filtered carts
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

  const getErrorMessage = (error: any) => {
    if (error instanceof Error) {
      if (error.message.includes('Unable to connect')) {
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-2">
              <WifiOff className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium">Connection Error</p>
                <p>{error.message}</p>
              </div>
            </div>
            <Button 
              onClick={retryFetchCarts} 
              disabled={isRetrying}
              className="flex items-center gap-2 w-fit"
            >
              {isRetrying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Reconnecting...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Retry Connection
                </>
              )}
            </Button>
          </div>
        )
      }
      return error.message
    }
    return "Failed to load carts. Please try again later."
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <CartHeader onAddClick={() => setIsAddDialogOpen(true)} />
          <div className="mt-6">
            <Card className="border-destructive/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <CardTitle>Connection Error</CardTitle>
                </div>
                <CardDescription>
                  We're having trouble connecting to the server
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                  <AlertDescription className="mt-2">
                    {getErrorMessage(error)}
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={retryFetchCarts} 
                  disabled={isRetrying}
                  className="flex items-center gap-2"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Reconnecting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Retry Connection
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        <CartHeader onAddClick={() => setIsAddDialogOpen(true)} />
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Loading carts data...</p>
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
