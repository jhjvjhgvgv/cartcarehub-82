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
      className="cursor-pointer hover:bg-muted/60"
    >
      <TableCell className="py-4 px-3">
        <div className="font-medium">{cart.rfidTag}</div>
      </TableCell>
      <TableCell className="hidden sm:table-cell py-4 px-3">
        <div>{cart.store}</div>
      </TableCell>
      <TableCell className="py-4 px-3">
        <CartStatusBadge status={cart.status} />
      </TableCell>
      <TableCell className="hidden sm:table-cell py-4 px-3">
        <div>{cart.lastMaintenance}</div>
      </TableCell>
      <TableCell className="py-4 px-2">
        <CartActions cart={cart} onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  )
}