
import { useState, useCallback } from "react"
import { Cart } from "@/types/cart"
import { useToast } from "@/hooks/use-toast"

export const useCarts = (initialCarts: Cart[]) => {
  const [carts, setCarts] = useState<Cart[]>(initialCarts)
  const { toast } = useToast()

  const handleSubmit = useCallback((data: any, editingCart: Cart | null, managedStores: Array<{ id: string; name: string }>) => {
    try {
      console.log('handleSubmit called with data:', data); // Debug log
      
      if (Array.isArray(data)) {
        // Handle bulk updates
        setCarts(prevCarts => {
          const updatedCarts = prevCarts.map(cart => {
            const update = data.find(update => update.id === cart.id)
            if (!update) return cart
            
            return {
              ...cart,
              ...update,
              issues: Array.isArray(update.issues) ? update.issues : (update.issues ? update.issues.split('\n') : cart.issues),
            }
          })
          return updatedCarts
        })
        
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

        setCarts(prevCarts => prevCarts.map((cart) =>
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
        ))
        
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

        setCarts(prevCarts => {
          // Check if cart with same RFID already exists
          const existingCart = prevCarts.find(cart => cart.rfidTag === data.rfidTag)
          if (existingCart) {
            toast({
              title: "Error",
              description: "A cart with this QR code already exists.",
              variant: "destructive",
            })
            return prevCarts
          }

          // Ensure we have a valid cart object
          if (!data.rfidTag || !data.store || !data.status) {
            toast({
              title: "Error",
              description: "Please fill in all required fields.",
              variant: "destructive",
            })
            return prevCarts
          }

          // Generate new cart ID
          const lastCart = prevCarts[prevCarts.length - 1]
          const lastNumber = lastCart ? parseInt(lastCart.id.split('-')[1]) : 0
          const newId = `CART-${String(lastNumber + 1).padStart(3, '0')}`

          // Create new cart
          const newCart: Cart = {
            id: newId,
            rfidTag: data.rfidTag,
            store: data.store,
            storeId: store.id,
            status: data.status,
            lastMaintenance: data.lastMaintenance || new Date().toISOString().split('T')[0],
            issues: Array.isArray(data.issues) ? data.issues : (data.issues ? data.issues.split('\n') : []),
          }

          console.log('Adding new cart:', newCart); // Debug log
          
          // Return updated cart list
          const updatedCarts = [...prevCarts, newCart]
          console.log('Updated carts list:', updatedCarts); // Debug log
          
          toast({
            title: "Success",
            description: "New cart has been added to the system.",
          })
          
          return updatedCarts
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
  }, [toast])

  const handleDeleteCart = useCallback((cartId: string) => {
    setCarts(prevCarts => prevCarts.filter((cart) => cart.id !== cartId))
    toast({
      title: "Success",
      description: "Cart has been removed from the system.",
      variant: "destructive",
    })
  }, [toast])

  return {
    carts,
    handleSubmit,
    handleDeleteCart,
  }
}
