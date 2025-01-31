import { Badge } from "@/components/ui/badge"
import { Cart } from "@/types/cart"

interface CartStatusBadgeProps {
  status: Cart["status"]
}

export function CartStatusBadge({ status }: CartStatusBadgeProps) {
  const statusStyles = {
    active: "bg-green-500",
    maintenance: "bg-yellow-500",
    retired: "bg-red-500",
  }

  return (
    <Badge className={`${statusStyles[status]} text-white px-4 py-1`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}