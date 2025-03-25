
import { Badge } from "@/components/ui/badge"
import { Cart } from "@/types/cart"
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"

interface CartStatusBadgeProps {
  status: Cart["status"]
}

export function CartStatusBadge({ status }: CartStatusBadgeProps) {
  const statusConfig = {
    active: {
      className: "bg-green-500 hover:bg-green-600",
      icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
      text: "Active"
    },
    maintenance: {
      className: "bg-yellow-500 hover:bg-yellow-600 text-black",
      icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />,
      text: "Maintenance"
    },
    retired: {
      className: "bg-red-500 hover:bg-red-600",
      icon: <XCircle className="h-3.5 w-3.5 mr-1" />,
      text: "Retired"
    }
  };

  const config = statusConfig[status];

  return (
    <Badge className={`text-white px-3 py-1 flex items-center ${config.className}`}>
      {config.icon}
      {config.text}
    </Badge>
  );
}
