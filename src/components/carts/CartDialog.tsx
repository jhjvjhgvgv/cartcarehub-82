
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Cart } from "@/types/cart"
import { useToast } from "@/hooks/use-toast"
import { SingleCartEdit } from "./SingleCartEdit"
import { BulkCartEdit } from "./BulkCartEdit"
import { CartForm } from "../cart-form"

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
  const isMultipleEdit = editingCart?.id?.includes(",")
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
    
    if (isMultipleEdit) {
      // For bulk updates, preserve original RFID tags and IDs
      if (!data.id) {
        const bulkUpdates = cartIds.map(cartId => {
          const originalCart = editingCart?.originalCarts?.find(cart => cart.id === cartId)
          return {
            ...originalCart,
            store: data.store || originalCart?.store,
            storeId: store.id,
            status: data.status || originalCart?.status,
            lastMaintenance: data.lastMaintenance || originalCart?.lastMaintenance,
            issues: data.issues ? data.issues.split('\n') : originalCart?.issues || [],
            rfidTag: originalCart?.rfidTag, // Preserve original RFID
          }
        })
        onSubmit(bulkUpdates)
      } else {
        // Individual cart update within bulk edit
        const originalCart = editingCart?.originalCarts?.find(cart => cart.id === data.id)
        onSubmit({
          ...originalCart,
          ...data,
          id: data.id,
          storeId: store.id,
          rfidTag: originalCart?.rfidTag, // Preserve original RFID
          issues: data.issues ? data.issues.split('\n') : [],
        })
      }
    } else if (editingCart) {
      // Single cart edit
      onSubmit({
        ...editingCart,
        ...data,
        id: editingCart?.id,
        storeId: store.id,
        rfidTag: editingCart?.rfidTag, // Preserve original RFID
        issues: data.issues ? data.issues.split('\n') : [],
      })
    } else {
      // New cart creation
      onSubmit({
        ...data,
        storeId: store.id,
        issues: data.issues ? data.issues.split('\n') : [],
      })
    }
    
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="max-h-[80vh] overflow-y-auto px-1">
          <DialogTitle>
            {isMultipleEdit 
              ? `Edit Multiple Carts (${cartIds.length} selected)`
              : editingCart ? "Edit Cart" : "Add New Cart"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {isMultipleEdit 
              ? "Edit multiple carts individually or apply changes to all selected carts."
              : editingCart 
                ? "Update the cart details below." 
                : "Fill in the details to add a new cart to the system."}
          </DialogDescription>
          
          <div className="mt-4">
            {isMultipleEdit ? (
              <BulkCartEdit
                editingCart={editingCart}
                cartIds={cartIds}
                onSubmit={handleSubmit}
                onCancel={() => onOpenChange(false)}
                onDelete={onDelete}
              />
            ) : editingCart ? (
              <SingleCartEdit
                cart={editingCart}
                onSubmit={handleSubmit}
                onCancel={() => onOpenChange(false)}
                onDelete={onDelete}
              />
            ) : (
              <CartForm
                onSubmit={handleSubmit}
                onCancel={() => onOpenChange(false)}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
