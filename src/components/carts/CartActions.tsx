import { Button } from "@/components/ui/button"
import { PencilIcon, Trash2Icon } from "lucide-react"
import { Cart } from "./CartList"

interface CartActionsProps {
  cart: Cart
  onEdit: (cart: Cart) => void
  onDelete: (cartId: string) => void
}

export function CartActions({ cart, onEdit, onDelete }: CartActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(cart)}
        className="hover:bg-primary-50"
      >
        <PencilIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(cart.id)}
        className="hover:bg-red-50"
      >
        <Trash2Icon className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  )
}