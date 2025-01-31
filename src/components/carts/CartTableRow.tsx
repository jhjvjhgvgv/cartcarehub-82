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
      <TableCell className="py-4">
        <div className="font-medium break-all">{cart.rfidTag}</div>
      </TableCell>
      <TableCell className="hidden md:table-cell py-4">
        <div className="break-all">{cart.store}</div>
      </TableCell>
      <TableCell className="py-4">
        <CartStatusBadge status={cart.status} />
      </TableCell>
      <TableCell className="hidden md:table-cell py-4">
        <div className="break-all">{cart.lastMaintenance}</div>
      </TableCell>
      <TableCell className="text-right py-4">
        <CartActions cart={cart} onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  )
}