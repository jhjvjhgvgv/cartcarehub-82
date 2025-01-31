import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { CartForm } from "@/components/cart-form"
import { Cart } from "@/types/cart"
import { useToast } from "@/hooks/use-toast"

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogTitle>{editingCart ? "Edit Cart" : "Add New Cart"}</DialogTitle>
        <CartForm
          initialData={
            editingCart
              ? {
                  rfidTag: editingCart.rfidTag,
                  store: editingCart.store,
                  status: editingCart.status,
                  lastMaintenance: editingCart.lastMaintenance,
                  issues: editingCart.issues.join("\n"),
                }
              : undefined
          }
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}