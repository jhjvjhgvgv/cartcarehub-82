import { useState } from "react"
import { Cart } from "@/types/cart"
import { useToast } from "@/hooks/use-toast"

export const useCarts = (initialCarts: Cart[]) => {
  const [carts, setCarts] = useState<Cart[]>(initialCarts)
  const { toast } = useToast()

  const handleSubmit = (data: any, editingCart: Cart | null, managedStores: Array<{ id: string; name: string }>) => {
    if (Array.isArray(data)) {
      // Handle bulk updates
      const updatedCarts = carts.map(cart => {
        const update = data.find(update => update.id === cart.id)
        return update || cart
      })
      
      setCarts(updatedCarts)
      toast({
        title: "Carts Updated",
        description: `Successfully updated ${data.length} carts.`,
      })
    } else if (editingCart) {
      // Handle single cart update
      const store = managedStores.find(s => s.name === data.store)
      if (!store) return

      const updatedCarts = carts.map((cart) =>
        cart.id === editingCart.id
          ? {
              ...cart,
              rfidTag: data.rfidTag || cart.rfidTag,
              store: data.store,
              storeId: store.id,
              status: data.status,
              lastMaintenance: data.lastMaintenance,
              issues: Array.isArray(data.issues) ? data.issues : (data.issues ? data.issues.split('\n') : []),
            }
          : cart
      )
      setCarts(updatedCarts)
      toast({
        title: "Cart Updated",
        description: "Cart details have been successfully updated.",
      })
    } else {
      // Handle adding new cart
      const store = managedStores.find(s => s.name === data.store)
      if (!store) return

      const newCart: Cart = {
        id: `CART-${String(carts.length + 1).padStart(3, "0")}`,
        rfidTag: data.rfidTag,
        store: data.store,
        storeId: store.id,
        status: data.status,
        lastMaintenance: data.lastMaintenance,
        issues: data.issues ? data.issues.split('\n') : [],
      }
      setCarts([...carts, newCart])
      toast({
        title: "Cart Added",
        description: "New cart has been successfully added to the system.",
      })
    }
  }

  const handleDeleteCart = (cartId: string) => {
    setCarts(carts.filter((cart) => cart.id !== cartId))
    toast({
      title: "Cart Deleted",
      description: "Cart has been successfully removed from the system.",
      variant: "destructive",
    })
  }

  return {
    carts,
    handleSubmit,
    handleDeleteCart,
  }
}