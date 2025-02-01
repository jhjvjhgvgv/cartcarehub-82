import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Cart } from "@/types/cart"
import { useToast } from "@/hooks/use-toast"
import { SingleCartEdit } from "./SingleCartEdit"
import { BulkCartEdit } from "./BulkCartEdit"

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
    
    if (isMultipleEdit && !data.id) {
      // For bulk updates, preserve original RFID tags and IDs
      const bulkUpdates = cartIds.map(cartId => {
        const originalCart = editingCart?.originalCarts?.find(cart => cart.id === cartId)
        return {
          ...originalCart, // Keep all original values
          ...data, // Only override fields that were actually changed
          id: cartId,
          rfidTag: originalCart?.rfidTag || "", // Preserve original RFID
          issues: data.issues ? data.issues.split('\n') : originalCart?.issues || [],
        }
      })
      onSubmit(bulkUpdates)
    } else {
      // For single cart edit, preserve all original values and only update changed fields
      const submissionData = {
        ...editingCart, // Keep all original values
        ...data, // Only override fields that were actually changed
        id: editingCart?.id,
        rfidTag: data.rfidTag || editingCart?.rfidTag, // Preserve original RFID if not changed
        issues: data.issues ? data.issues.split('\n') : editingCart?.issues || [],
      }
      onSubmit(submissionData)
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
          <BulkCartEdit
            editingCart={editingCart}
            cartIds={cartIds}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            onDelete={handleDelete}
          />
        ) : (
          editingCart && (
            <SingleCartEdit
              cart={editingCart}
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
              onDelete={handleDelete}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  )
}