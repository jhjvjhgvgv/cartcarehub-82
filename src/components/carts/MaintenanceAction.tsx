import { WrenchIcon } from "lucide-react"
import { CartActionButton } from "./CartActionButton"
import { Cart } from "@/types/cart"
import { useToast } from "@/hooks/use-toast"

interface MaintenanceActionProps {
  cart: Cart
  onEdit: (cart: Cart) => void
  disabled: boolean
}

export function MaintenanceAction({
  cart,
  onEdit,
  disabled
}: MaintenanceActionProps) {
  const { toast } = useToast()

  const handleMaintenanceClick = () => {
    // Update the cart's status to out_of_service
    const updatedCart = {
      ...cart,
      status: "out_of_service" as const,
    }
    
    onEdit(updatedCart)
    
    toast({
      title: "Cart Status Updated",
      description: `Cart ${cart.asset_tag || cart.qr_token} has been marked for maintenance.`,
    })
  }

  // Only show if cart is not already out_of_service
  if (cart.status === "out_of_service") {
    return null
  }

  return (
    <CartActionButton
      icon={<WrenchIcon className="h-4 w-4" />}
      onClick={handleMaintenanceClick}
      className="hover:bg-yellow-100 hover:text-yellow-900 transition-colors duration-200"
      disabled={disabled}
      tooltip="Mark for maintenance"
    />
  )
}
