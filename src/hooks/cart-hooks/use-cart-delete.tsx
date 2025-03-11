
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteCart } from "@/api/carts"
import { useToast } from "@/hooks/use-toast"

export const useCartDelete = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { mutate: handleDeleteCart, isPending: isDeleting } = useMutation({
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

  return { handleDeleteCart, isDeleting }
}
