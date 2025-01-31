import { TableCell, TableRow } from "@/components/ui/table"
import { Cart } from "./CartList"
import { CartStatusBadge } from "./CartStatusBadge"
import { CartActions } from "./CartActions"

interface CartTableRowProps {
  cart: Cart
  onEdit: (cart: Cart) => void
  onDelete: (cartId: string) => void
  onClick: (cartId: string, event: React.MouseEvent) => void
}

export function CartTableRow({ cart, onEdit, onDelete, onClick }: CartTableRowProps) {
  return (
    <TableRow 
      onClick={(e) => onClick(cart.id, e)}
      className="cursor-pointer hover:bg-muted/60 min-h-[140px] md:min-h-[60px]"
    >
      <TableCell className="font-medium">
        <div className="flex flex-col md:flex-row items-start md:items-center">
          {cart.rfidTag}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex flex-col md:flex-row items-start md:items-center">
          {cart.store}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col md:flex-row items-start md:items-center">
          <CartStatusBadge status={cart.status} />
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex flex-col md:flex-row items-start md:items-center">
          {cart.lastMaintenance}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <CartActions cart={cart} onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  )
}