
import { useState } from "react"
import { Cart } from "@/types/cart"
import { useToast } from "@/hooks/use-toast"

export const useCarts = (initialCarts: Cart[]) => {
  const [carts, setCarts] = useState<Cart[]>(initialCarts)
  const { toast } = useToast()

  const generateCartId = () => {
    const lastCart = carts[carts.length - 1]
    if (!lastCart) return "CART-001"
    
    const lastNumber = parseInt(lastCart.id.split('-')[1])
    return `CART-${String(lastNumber + 1).padStart(3, '0')}`
  }

  const handleSubmit = (data: any, editingCart: Cart | null, managedStores: Array<{ id: string; name: string }>) => {
    try {
      if (Array.isArray(data)) {
        // Handle bulk updates
        const updatedCarts = carts.map(cart => {
          const update = data.find(update => update.id === cart.id)
          if (!update) return cart
          
          return {
            ...cart,
            ...update,
            issues: Array.isArray(update.issues) ? update.issues : (update.issues ? update.issues.split('\n') : cart.issues),
          }
        })
        
        setCarts(updatedCarts)
        toast({
          title: "Success",
          description: `Successfully updated ${data.length} carts.`,
        })
      } else if (editingCart) {
        // Handle single cart update
        const store = managedStores.find(s => s.name === data.store)
        if (!store) {
          toast({
            title: "Error",
            description: "Selected store not found.",
            variant: "destructive",
          })
          return
        }

        const updatedCarts = carts.map((cart) =>
          cart.id === editingCart.id
            ? {
                ...cart,
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
          title: "Success",
          description: "Cart details have been updated.",
        })
      } else {
        // Handle adding new cart
        const store = managedStores.find(s => s.name === data.store)
        if (!store) {
          toast({
            title: "Error",
            description: "Selected store not found.",
            variant: "destructive",
          })
          return
        }

        // Check if cart with same RFID already exists
        const existingCart = carts.find(cart => cart.rfidTag === data.rfidTag)
        if (existingCart) {
          toast({
            title: "Error",
            description: "A cart with this QR code already exists.",
            variant: "destructive",
          })
          return
        }

        // Ensure we have a valid cart object
        if (!data.rfidTag || !data.store || !data.status) {
          toast({
            title: "Error",
            description: "Please fill in all required fields.",
            variant: "destructive",
          })
          return
        }

        // Add new cart with validated data and generated ID
        const newCart: Cart = {
          id: generateCartId(),
          rfidTag: data.rfidTag,
          store: data.store,
          storeId: store.id,
          status: data.status,
          lastMaintenance: data.lastMaintenance || new Date().toISOString().split('T')[0],
          issues: Array.isArray(data.issues) ? data.issues : (data.issues ? data.issues.split('\n') : []),
        }

        setCarts(prevCarts => [...prevCarts, newCart])
        toast({
          title: "Success",
          description: "New cart has been added to the system.",
        })
      }
    } catch (error) {
      console.error('Error updating carts:', error)
      toast({
        title: "Error",
        description: "An error occurred while updating the cart.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCart = (cartId: string) => {
    setCarts(carts.filter((cart) => cart.id !== cartId))
    toast({
      title: "Success",
      description: "Cart has been removed from the system.",
      variant: "destructive",
    })
  }

  return {
    carts,
    handleSubmit,
    handleDeleteCart,
  }
}
