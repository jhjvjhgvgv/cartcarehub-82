import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Cart } from "@/types/cart"
import { useToast } from "@/hooks/use-toast"
import { SingleCartEdit } from "./SingleCartEdit"
import { BulkCartEdit } from "./BulkCartEdit"
import { CartForm } from "../cart-form"
import { useEffect } from "react"

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

  useEffect(() => {
    console.log('Dialog state changed:', { isOpen, editingCart })
  }, [isOpen, editingCart])

  const handleSubmit = (data: any) => {
    console.log('Dialog handleSubmit called with:', data)
    console.log('Using managedStores:', managedStores)
    
    if (!data.store) {
      console.error("Missing store selection in form data:", data)
      toast({
        title: "Error",
        description: "Please select a store from the dropdown.",
        variant: "destructive",
      })
      return
    }
    
    try {
      const store = managedStores.find((s) => s.name === data.store)
      if (!store) {
        console.error("Store validation failed in dialog. Selected store:", data.store, "Available stores:", managedStores)
        toast({
          title: "Error",
          description: `Selected store "${data.store}" is not in your managed stores list.`,
          variant: "destructive",
        })
        return
      }
      
      onSubmit({...data, managedStores})
    } catch (error) {
      console.error('Error in dialog submit:', error)
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
                initialData={{
                  rfidTag: "",
                  store: managedStores[0]?.name || "",
                  status: "active",
                  issues: "",
                  lastMaintenance: new Date().toISOString().split('T')[0],
                }}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
