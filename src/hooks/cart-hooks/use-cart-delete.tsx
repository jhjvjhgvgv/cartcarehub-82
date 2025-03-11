
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteCart } from "@/api/carts"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"

export const useCartDelete = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { mutate: handleDeleteCart, isPending: isDeleting } = useMutation({
    mutationFn: deleteCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carts"] })
      // No toast here, let the component handle it based on context
      
      // Navigate back to carts list if we're on a cart details page
      // The calling component can override this by providing its own navigation
      const currentPath = window.location.pathname
      if (currentPath.startsWith('/carts/')) {
        navigate('/carts')
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting the cart.",
        variant: "destructive",
      })
    },
  })

  return { handleDeleteCart, isDeleting }
}
