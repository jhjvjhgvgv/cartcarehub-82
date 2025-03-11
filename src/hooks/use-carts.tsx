
import { Cart } from "@/types/cart"
import { CartMutationParams } from "@/types/cart-mutations"
import { useFetchCarts, useCartSubmit, useCartDelete } from "./cart-hooks"

export const useCarts = () => {
  // Use the individual hooks
  const { carts, isLoading, error, isRetrying, retryFetchCarts } = useFetchCarts()
  const { handleSubmit } = useCartSubmit()
  const { handleDeleteCart } = useCartDelete()

  // Return a unified API that matches the original hook
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
