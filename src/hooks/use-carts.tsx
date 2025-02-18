
import { useState, useCallback, useEffect, useRef } from "react"
import { Cart } from "@/types/cart"
import { useToast } from "@/hooks/use-toast"

export const useCarts = (initialCarts: Cart[]) => {
  const initialized = useRef(false)
  const [carts, setCarts] = useState<Cart[]>([])
  const { toast } = useToast()

  // Initialize carts only once
  useEffect(() => {
    if (!initialized.current) {
      console.log('Initializing carts with:', initialCarts)
      setCarts(initialCarts)
      initialized.current = true
    }
  }, [initialCarts])

  // Debug effect to track cart state changes
  useEffect(() => {
    console.log('Carts state updated:', carts)
  }, [carts])

  const handleSubmit = useCallback((data: any, editingCart: Cart | null, managedStores: Array<{ id: string; name: string }>) => {
    console.log('handleSubmit called:', { data, editingCart })
    
    setCarts(prevCarts => {
      try {
        if (Array.isArray(data)) {
          // Handle bulk updates
          const updatedCarts = prevCarts.map(cart => {
            const update = data.find(update => update.id === cart.id)
            if (!update) return cart
            return {
              ...cart,
              ...update,
              issues: Array.isArray(update.issues) ? update.issues : (update.issues ? update.issues.split('\n') : cart.issues),
            }
          })
          
          toast({
            title: "Success",
            description: `Successfully updated ${data.length} carts.`,
          })
          
          return updatedCarts
        } 
        
        if (editingCart) {
          // Handle single cart update
          const store = managedStores.find(s => s.name === data.store)
          if (!store) {
            toast({
              title: "Error",
              description: "Selected store not found.",
              variant: "destructive",
            })
            return prevCarts
          }

          if (editingCart.id.includes(',')) {
            // Handle multiple cart edit
            const cartIds = editingCart.id.split(',')
            return prevCarts.map(cart => {
              if (!cartIds.includes(cart.id)) return cart
              return {
                ...cart,
                store: data.store,
                storeId: store.id,
                status: data.status,
                lastMaintenance: data.lastMaintenance,
                issues: Array.isArray(data.issues) ? data.issues : (data.issues ? data.issues.split('\n') : []),
              }
            })
          }

          const updatedCarts = prevCarts.map((cart) =>
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
          
          toast({
            title: "Success",
            description: "Cart details have been updated.",
          })
          
          return updatedCarts
        }
        
        // Handle adding new cart
        const store = managedStores.find(s => s.name === data.store)
        if (!store) {
          toast({
            title: "Error",
            description: "Selected store not found.",
            variant: "destructive",
          })
          return prevCarts
        }

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

        console.log('Adding new cart:', newCart)
        const updatedCarts = [...prevCarts, newCart]
        console.log('Updated carts list:', updatedCarts)
        
        toast({
          title: "Success",
          description: "New cart has been added to the system.",
        })
        
        return updatedCarts
      } catch (error) {
        console.error('Error in handleSubmit:', error)
        toast({
          title: "Error",
          description: "An error occurred while updating the cart.",
          variant: "destructive",
        })
        return prevCarts
      }
    })
  }, [toast])

  const handleDeleteCart = useCallback((cartId: string) => {
    setCarts(prevCarts => {
      const newCarts = prevCarts.filter((cart) => cart.id !== cartId)
      toast({
        title: "Success",
        description: "Cart has been removed from the system.",
      })
      return newCarts
    })
  }, [toast])

  return {
    carts,
    handleSubmit,
    handleDeleteCart,
  }
}
