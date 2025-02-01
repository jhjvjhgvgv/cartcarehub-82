import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CartForm } from "@/components/cart-form"
import { Cart } from "@/types/cart"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Trash2Icon } from "lucide-react"

interface CartDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  onDelete: (cartId: string) => void
  editingCart: Cart | null
  managedStores: Array<{ id: string; name: string }>
}

export function CartDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  onDelete,
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
    
    // If it's a bulk edit, preserve the original RFID tags
    if (isMultipleEdit && !data.id) {
      const bulkUpdates = cartIds.map(cartId => {
        const originalCart = editingCart?.originalCarts?.find(cart => cart.id === cartId)
        return {
          ...data,
          id: cartId,
          rfidTag: originalCart?.rfidTag || ""
        }
      })
      onSubmit(bulkUpdates)
    } else {
      // For single edit, if RFID is unchanged, use the original
      if (editingCart && data.rfidTag === editingCart.rfidTag) {
        onSubmit({
          ...data,
          rfidTag: editingCart.rfidTag
        })
      } else {
        onSubmit(data)
      }
    }
  }

  const handleDelete = (cartId: string) => {
    onDelete(cartId)
    onOpenChange(false)
    toast({
      title: "Cart Deleted",
      description: "The cart has been successfully deleted.",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogTitle>
          {isMultipleEdit 
            ? `Edit Multiple Carts (${cartIds.length} selected)`
            : editingCart ? "Edit Cart" : "Add New Cart"}
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

                    return (
                      <div key={cartId} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h4 className="text-sm font-medium">Cart ID: {cartId}</h4>
                            <p className="text-sm text-muted-foreground">RFID: {originalCart?.rfidTag}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(cartId)}
                            className="h-8 w-8 p-0 hover:bg-red-50"
                          >
                            <Trash2Icon className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <CartForm
                          initialData={{
                            rfidTag: originalCart?.rfidTag || "",
                            store: originalCart?.store || editingCart?.store || "",
                            status: originalCart?.status || editingCart?.status || "active",
                            lastMaintenance: originalCart?.lastMaintenance || editingCart?.lastMaintenance || "",
                            issues: Array.isArray(originalCart?.issues) ? originalCart.issues.join("\n") : "",
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
                  rfidTag: "Multiple RFIDs - Will Be Preserved",
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
          <div>
            {editingCart && (
              <div className="flex justify-end mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(editingCart.id)}
                  className="h-8 w-8 p-0 hover:bg-red-50"
                >
                  <Trash2Icon className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            )}
            <CartForm
              initialData={
                editingCart
                  ? {
                      rfidTag: editingCart.rfidTag || "",
                      store: editingCart.store || "",
                      status: editingCart.status || "active",
                      lastMaintenance: editingCart.lastMaintenance || "",
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
