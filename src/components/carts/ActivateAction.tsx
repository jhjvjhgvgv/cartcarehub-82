import { CheckIcon } from "lucide-react"
import { CartActionButton } from "./CartActionButton"
import { Cart } from "@/types/cart"
import { useToast } from "@/hooks/use-toast"

interface ActivateActionProps {
  cart: Cart
  onEdit: (cart: Cart) => void
  disabled: boolean
}

export function ActivateAction({
  cart,
  onEdit,
  disabled
}: ActivateActionProps) {
  const { toast } = useToast()

  const handleActivateClick = () => {
    // Update the cart's status to in_service
    const updatedCart = {
      ...cart,
      status: "in_service" as const
    }
    onEdit(updatedCart)
    
    toast({
      title: "Cart Status Updated",
      description: `Cart ${cart.asset_tag || cart.qr_token} has been marked as active.`,
    })
  }

  // Only show if cart is out_of_service (maintenance)
  if (cart.status !== "out_of_service") {
    return null
  }

  return (
    <CartActionButton
      icon={<CheckIcon className="h-4 w-4" />}
      onClick={handleActivateClick}
      className="hover:bg-green-100 hover:text-green-900"
      disabled={disabled}
    />
  )
}
