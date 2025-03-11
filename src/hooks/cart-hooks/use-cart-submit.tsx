
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Cart } from "@/types/cart"
import { updateCart, createCart } from "@/api/carts"
import { useToast } from "@/hooks/use-toast"
import { CartMutationParams } from "@/types/cart-mutations"

export const useCartSubmit = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { mutate: handleSubmit } = useMutation({
    mutationFn: async (params: CartMutationParams) => {
      const { data, editingCart, managedStores } = params

      try {
        if (Array.isArray(data)) {
          const updatePromises = data.map(update => {
            const cart = queryClient.getQueryData<Cart[]>(["carts"])?.find(c => c.id === update.id)
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
              const cart = queryClient.getQueryData<Cart[]>(["carts"])?.find(c => c.id === id)
              if (!cart) return null
              
              return updateCart({
                ...cart,
                store: data.store,
                storeId: store.id,
                store_id: store.id,
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
            store_id: store.id,
            status: data.status,
            issues: Array.isArray(data.issues) ? data.issues : (data.issues ? data.issues.split('\n') : []),
          })
          return
        }

        const existingCart = queryClient.getQueryData<Cart[]>(["carts"])?.find(cart => cart.qr_code === data.qr_code)
        if (existingCart) {
          throw new Error("A cart with this QR code already exists")
        }

        await createCart({
          qr_code: data.qr_code,
          store: data.store,
          storeId: store.id,
          store_id: store.id,
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

  return { handleSubmit }
}
