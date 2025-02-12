
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
    try {
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
        if (!data.id) {
          // Handle bulk update for all selected carts
          const bulkUpdates = cartIds.map(cartId => {
            const originalCart = editingCart?.originalCarts?.find(cart => cart.id === cartId)
            if (!originalCart) return null
            return {
              ...originalCart,
              store: data.store || originalCart.store,
              storeId: store.id,
              status: data.status || originalCart.status,
              lastMaintenance: data.lastMaintenance || originalCart.lastMaintenance,
              issues: data.issues ? data.issues.split('\n') : originalCart.issues,
            }
          }).filter(Boolean)
          onSubmit(bulkUpdates)
        } else {
          // Handle single cart update within bulk edit
          const originalCart = editingCart?.originalCarts?.find(cart => cart.id === data.id)
          if (!originalCart) {
            toast({
              title: "Error",
              description: "Cart not found.",
              variant: "destructive",
            })
            return
          }
          onSubmit({
            ...originalCart,
            store: data.store,
            storeId: store.id,
            status: data.status,
            lastMaintenance: data.lastMaintenance,
            issues: data.issues ? data.issues.split('\n') : [],
          })
        }
      } else if (editingCart) {
        // Handle single cart update
        onSubmit({
          ...editingCart,
          store: data.store,
          storeId: store.id,
          status: data.status,
          lastMaintenance: data.lastMaintenance,
          issues: data.issues ? data.issues.split('\n') : [],
        })
      } else {
        // Handle new cart creation
        const newCart: Cart = {
          id: `CART-${Date.now().toString().slice(-6)}`,
          rfidTag: data.rfidTag,
          store: data.store,
          storeId: store.id,
          status: data.status,
          lastMaintenance: data.lastMaintenance,
          issues: data.issues ? data.issues.split('\n') : [],
        }
        onSubmit(newCart)
      }
      
      onOpenChange(false)
      toast({
        title: "Success",
        description: editingCart ? "Cart updated successfully" : "New cart added successfully",
      })
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      toast({
        title: "Error",
        description: "An error occurred while saving the cart.",
        variant: "destructive",
      })
    }
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
