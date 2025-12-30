import { useQuery } from "@tanstack/react-query"
import { Cart } from "@/types/cart"
import { fetchCarts } from "@/api/carts"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export const useFetchCarts = () => {
  const { toast } = useToast()
  const [isRetrying, setIsRetrying] = useState(false)

  const { 
    data: rawCarts = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["carts"],
    queryFn: fetchCarts,
    retry: 2,
    retryDelay: 1000,
  })

  // Return carts directly without adding predictions
  // Predictions are computed separately when needed
  const carts: Cart[] = Array.isArray(rawCarts) ? rawCarts : [];

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

  return {
    carts,
    isLoading,
    error,
    isRetrying,
    retryFetchCarts,
  }
}
