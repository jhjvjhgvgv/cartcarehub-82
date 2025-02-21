
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Cart } from "@/types/cart"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

// Fetch carts from Supabase
const fetchCarts = async (): Promise<Cart[]> => {
  const { data, error } = await supabase
    .from('carts')
    .select('*')
    .order('id', { ascending: true }) as unknown as { 
      data: Cart[] | null; 
      error: Error | null 
    }

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

// Update a cart in Supabase
const updateCart = async (cart: Cart): Promise<Cart> => {
  const { data, error } = await supabase
    .from('carts')
    .update({
      rfidTag: cart.rfidTag,
      store: cart.store,
      storeId: cart.storeId,
      status: cart.status,
      lastMaintenance: cart.lastMaintenance,
      issues: cart.issues,
    })
    .eq('id', cart.id)
    .select()
    .single() as unknown as {
      data: Cart | null;
      error: Error | null;
    }

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error("Failed to update cart")
  }

  return data
}

// Create a new cart in Supabase
const createCart = async (cart: Omit<Cart, 'id'>): Promise<Cart> => {
  const { data, error } = await supabase
    .from('carts')
    .insert([cart])
    .select()
    .single() as unknown as {
      data: Cart | null;
      error: Error | null;
    }

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error("Failed to create cart")
  }

  return data
}

// Delete a cart from Supabase
const deleteCart = async (cartId: string): Promise<void> => {
  const { error } = await supabase
    .from('carts')
    .delete()
    .eq('id', cartId) as unknown as {
      error: Error | null;
    }

  if (error) {
    throw new Error(error.message)
  }
}

export const useCarts = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Query for fetching carts
  const { data: carts = [], isLoading, error } = useQuery({
    queryKey: ['carts'],
    queryFn: fetchCarts,
  })

  // Mutation for creating/updating carts
  const { mutate: handleSubmit } = useMutation({
    mutationFn: async (params: { 
      data: any, 
      editingCart: Cart | null, 
      managedStores: Array<{ id: string; name: string }> 
    }) => {
      const { data, editingCart, managedStores } = params

      try {
        if (Array.isArray(data)) {
          // Handle bulk updates
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
          throw new Error("Selected store not found")
        }

        if (editingCart) {
          if (editingCart.id.includes(',')) {
            // Handle multiple cart edit
            const cartIds = editingCart.id.split(',')
            const updatePromises = cartIds.map(id => {
              const cart = carts.find(c => c.id === id)
              if (!cart) return null
              return updateCart({
                ...cart,
                store: data.store,
                storeId: store.id,
                status: data.status,
                lastMaintenance: data.lastMaintenance,
                issues: Array.isArray(data.issues) ? data.issues : (data.issues ? data.issues.split('\n') : []),
              })
            })

            await Promise.all(updatePromises.filter(Boolean))
            return
          }

          // Handle single cart update
          await updateCart({
            ...editingCart,
            store: data.store,
            storeId: store.id,
            status: data.status,
            lastMaintenance: data.lastMaintenance,
            issues: Array.isArray(data.issues) ? data.issues : (data.issues ? data.issues.split('\n') : []),
          })
          return
        }

        // Handle adding new cart
        const existingCart = carts.find(cart => cart.rfidTag === data.rfidTag)
        if (existingCart) {
          throw new Error("A cart with this QR code already exists")
        }

        // Create new cart
        await createCart({
          rfidTag: data.rfidTag,
          store: data.store,
          storeId: store.id,
          status: data.status,
          lastMaintenance: data.lastMaintenance || new Date().toISOString().split('T')[0],
          issues: Array.isArray(data.issues) ? data.issues : (data.issues ? data.issues.split('\n') : []),
        })
      } catch (error) {
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carts'] })
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

  // Mutation for deleting carts
  const { mutate: handleDeleteCart } = useMutation({
    mutationFn: deleteCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carts'] })
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
    handleSubmit,
    handleDeleteCart,
  }
}
