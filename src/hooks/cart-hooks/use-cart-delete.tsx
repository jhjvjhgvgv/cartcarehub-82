
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteCart } from "@/api/carts"
import { useToast } from "@/hooks/use-toast"
import { useNavigate, useLocation } from "react-router-dom"

export const useCartDelete = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()

  const { mutate: handleDeleteCart, isPending: isDeleting } = useMutation({
    mutationFn: deleteCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carts"] })
      
      // Only navigate if we're on a cart details page
      const currentPath = location.pathname
      if (currentPath.startsWith('/carts/')) {
        navigate('/carts', { replace: true })
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
