import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CartForm } from "@/components/cart-form"
import { Cart } from "@/types/cart"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CartDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  editingCart: Cart | null
  managedStores: Array<{ id: string; name: string }>
}

export function CartDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  editingCart,
  managedStores,
}: CartDialogProps) {
  const { toast } = useToast()
  const isMultipleEdit = editingCart?.id.includes(",")
  const cartIds = isMultipleEdit ? editingCart?.id.split(",") : []

  const handleSubmit = (data: any) => {
    const store = managedStores.find((s) => s.name === data.store)
    if (!store) {
      toast({
        title: "Error",
        description: "Selected store is not in your managed stores list.",
        variant: "destructive",
      })
      return
    }
    onSubmit(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogTitle>
          {isMultipleEdit ? "Edit Multiple Carts" : editingCart ? "Edit Cart" : "Add New Cart"}
        </DialogTitle>
        <DialogDescription>
          {isMultipleEdit 
            ? "Edit multiple carts individually or apply changes to all selected carts."
            : editingCart 
              ? "Update the cart details below." 
              : "Fill in the details to add a new cart to the system."}
        </DialogDescription>
        
        {isMultipleEdit ? (
          <Tabs defaultValue="individual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="individual">Individual Edits</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Edit</TabsTrigger>
            </TabsList>
            <TabsContent value="individual">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  {cartIds.map((cartId) => {
                    const originalCart = editingCart?.originalCarts?.find(cart => cart.id === cartId)

                    const cartData = {
                      rfidTag: originalCart?.rfidTag || editingCart?.rfidTag || '',
                      store: editingCart?.store || '',
                      status: editingCart?.status || 'active',
                      lastMaintenance: editingCart?.lastMaintenance || '',
                      issues: editingCart?.issues || [],
                    }

                    return (
                      <div key={cartId} className="border rounded-lg p-4">
                        <h4 className="text-sm font-medium mb-4">Cart ID: {cartId}</h4>
                        <CartForm
                          initialData={{
                            rfidTag: cartData.rfidTag,
                            store: cartData.store,
                            status: cartData.status,
                            lastMaintenance: cartData.lastMaintenance,
                            issues: Array.isArray(cartData.issues) ? cartData.issues.join("\n") : "",
                          }}
                          onSubmit={(data) => handleSubmit({ ...data, id: cartId })}
                          onCancel={() => onOpenChange(false)}
                          disableRfidTag={false}
                        />
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="bulk">
              <CartForm
                initialData={{
                  rfidTag: "Multiple Carts",
                  store: editingCart?.store || "",
                  status: editingCart?.status || "active",
                  lastMaintenance: editingCart?.lastMaintenance || "",
                  issues: Array.isArray(editingCart?.issues) 
                    ? editingCart.issues.join("\n") 
                    : "",
                }}
                onSubmit={handleSubmit}
                onCancel={() => onOpenChange(false)}
                disableRfidTag={true}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <CartForm
            initialData={
              editingCart
                ? {
                    rfidTag: editingCart.rfidTag,
                    store: editingCart.store,
                    status: editingCart.status,
                    lastMaintenance: editingCart.lastMaintenance,
                    issues: Array.isArray(editingCart.issues) 
                      ? editingCart.issues.join("\n") 
                      : "",
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            disableRfidTag={false}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}