import { Button } from "@/components/ui/button"
import { PencilIcon, Trash2Icon } from "lucide-react"
import { Cart } from "@/types/cart"

interface CartActionsProps {
  cart: Cart
  onEdit: (cart: Cart) => void
  onDelete: (cartId: string) => void
}

export function CartActions({ cart, onEdit, onDelete }: CartActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2 px-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(cart)}
        className="h-8 w-8 p-0 hover:bg-primary-50 flex items-center justify-center"
      >
        <PencilIcon className="h-4 w-4 text-primary-600" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(cart.id)}
        className="h-8 w-8 p-0 hover:bg-red-50 flex items-center justify-center"
      >
        <Trash2Icon className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  )
}