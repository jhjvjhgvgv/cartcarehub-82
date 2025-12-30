
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Cart } from "@/types/cart"
import { useToast } from "@/hooks/use-toast"
import { SingleCartEdit } from "./SingleCartEdit"
import { CartForm } from "../cart-form"
import { useEffect } from "react"

interface CartDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  onDelete: (cartId: string) => void
  editingCart: Cart | null
  managedStores: Array<{ id: string; name: string }>
  isSubmitting?: boolean
}

export function CartDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  onDelete,
  editingCart,
  managedStores,
  isSubmitting = false,
}: CartDialogProps) {
  const { toast } = useToast()
  const isMultipleEdit = editingCart?.id?.includes(",")
  const cartIds = isMultipleEdit ? editingCart?.id.split(",") : []

  useEffect(() => {
    console.log('Dialog state changed:', { isOpen, editingCart })
  }, [isOpen, editingCart])

  const handleSubmit = (data: any) => {
    console.log('Dialog handleSubmit called with:', data)
    console.log('Using managedStores:', managedStores)
    
    if (!data.store_org_id) {
      console.error("Missing store selection in form data:", data)
      toast({
        title: "Error",
        description: "Please select a store from the dropdown.",
        variant: "destructive",
      })
      return
    }
    
    try {
      const store = managedStores.find((s) => s.id === data.store_org_id)
      if (!store) {
        console.error("Store validation failed in dialog. Selected store:", data.store_org_id, "Available stores:", managedStores)
        toast({
          title: "Error",
          description: `Selected store is not in your managed stores list.`,
          variant: "destructive",
        })
        return
      }
      
      onSubmit(data)
      
      // Close the dialog on successful submit
      if (!isSubmitting) {
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error in dialog submit:', error)
      toast({
        title: "Error",
        description: "An error occurred while saving the cart.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = (cartId: string) => {
    onDelete(cartId)
    // Close the dialog after deletion
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={isSubmitting ? undefined : onOpenChange}>
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
            {editingCart ? (
              <SingleCartEdit
                cart={editingCart}
                onSubmit={handleSubmit}
                onCancel={() => onOpenChange(false)}
                onDelete={handleDelete}
                disabled={isSubmitting}
              />
            ) : (
              <CartForm
                onSubmit={handleSubmit}
                onCancel={() => onOpenChange(false)}
                initialData={{
                  qr_token: "",
                  store_org_id: managedStores[0]?.id || "",
                  status: "in_service",
                  asset_tag: "",
                  model: "",
                  notes: "",
                }}
                disabled={isSubmitting}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
