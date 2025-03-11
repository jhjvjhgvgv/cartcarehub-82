import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Cart } from "@/types/cart"
import { useToast } from "@/hooks/use-toast"
import { fetchCarts, updateCart, createCart, deleteCart } from "@/api/carts"
import { CartMutationParams } from "@/types/cart-mutations"
import { useState } from "react"

export const useCarts = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isRetrying, setIsRetrying] = useState(false)

  const { data: carts = [], isLoading, error, refetch } = useQuery({
    queryKey: ["carts"],
    queryFn: fetchCarts,
    retry: 2,
    retryDelay: 1000,
  })

  const retryFetchCarts = async () => {
    setIsRetrying(true)
    try {
      await refetch()
      toast({
        title: "Connection Restored",
        description: "Successfully reconnected to the server.",
      })
    } catch (err) {
      toast({
        title: "Connection Failed",
        description: "Failed to reconnect. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsRetrying(false)
    }
  }

  const { mutate: handleSubmit } = useMutation({
    mutationFn: async (params: CartMutationParams) => {
      const { data, editingCart, managedStores } = params

      try {
        if (Array.isArray(data)) {
          const updatePromises = data.map(update => {
            const cart = carts.find(c => c.id === update.id)
            if (!cart) return null
            
            return updateCart({
              ...cart,
              ...update,
              issues: Array.isArray(update.issues) ? update.issues : (update.issues ? update.issues.split('\n') : cart.issues),
            })
          })

          await Promise.all(updatePromises.filter(Boolean))
          return
        }

        const store = managedStores.find(s => s.name === data.store)
        if (!store) {
          console.error("Store validation failed. Selected store:", data.store, "Available stores:", managedStores)
          throw new Error(`Selected store "${data.store}" is not in your managed stores list`)
        }

        if (editingCart) {
          if (editingCart.id.includes(',')) {
            const cartIds = editingCart.id.split(',')
            const updatePromises = cartIds.map(id => {
              const cart = carts.find(c => c.id === id)
              if (!cart) return null
              
              return updateCart({
                ...cart,
                store: data.store,
                storeId: store.id,
                status: data.status,
                issues: Array.isArray(data.issues) ? data.issues : (data.issues ? data.issues.split('\n') : []),
              })
            })

            await Promise.all(updatePromises.filter(Boolean))
            return
          }

          await updateCart({
            ...editingCart,
            store: data.store,
            storeId: store.id,
            status: data.status,
            issues: Array.isArray(data.issues) ? data.issues : (data.issues ? data.issues.split('\n') : []),
          })
          return
        }

        const existingCart = carts.find(cart => cart.qr_code === data.qr_code)
        if (existingCart) {
          throw new Error("A cart with this QR code already exists")
        }

        await createCart({
          qr_code: data.qr_code,
          store: data.store,
          storeId: store.id,
          status: data.status,
          issues: Array.isArray(data.issues) ? data.issues : (data.issues ? data.issues.split('\n') : []),
          lastMaintenance: "",
        })
      } catch (error) {
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carts"] })
      toast({
        title: "Success",
        description: "Cart has been updated successfully.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating the cart.",
        variant: "destructive",
      })
    },
  })

  const { mutate: handleDeleteCart } = useMutation({
    mutationFn: deleteCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carts"] })
      toast({
        title: "Success",
        description: "Cart has been removed from the system.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting the cart.",
        variant: "destructive",
      })
    },
  })

  return {
    carts,
    isLoading,
    error,
    isRetrying,
    retryFetchCarts,
    handleSubmit,
    handleDeleteCart,
  }
}
