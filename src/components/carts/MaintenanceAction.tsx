
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
    // Update the cart's status to maintenance
    const updatedCart = {
      ...cart,
      status: "maintenance" as const
    }
    onEdit(updatedCart)
    
    toast({
      title: "Cart Status Updated",
      description: `Cart ${cart.qr_code} has been marked for maintenance.`,
    })
  }

  // Only show if cart is not already in maintenance
  if (cart.status === "maintenance") {
    return null
  }

  return (
    <CartActionButton
      icon={<WrenchIcon className="h-4 w-4" />}
      onClick={handleMaintenanceClick}
      className="hover:bg-yellow-100 hover:text-yellow-900"
      disabled={disabled}
    />
  )
}
