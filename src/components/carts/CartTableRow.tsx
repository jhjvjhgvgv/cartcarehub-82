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
      <TableCell className="py-4 px-4">
        <div className="grid gap-1">
          <div className="font-medium">{cart.rfidTag}</div>
          <div className="sm:hidden text-sm text-muted-foreground">{cart.store}</div>
          <div className="sm:hidden text-sm text-muted-foreground">Last Maintenance: {cart.lastMaintenance}</div>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell py-4 px-4">
        <div>{cart.store}</div>
      </TableCell>
      <TableCell className="py-4 px-4">
        <CartStatusBadge status={cart.status} />
      </TableCell>
      <TableCell className="hidden sm:table-cell py-4 px-4">
        <div>{cart.lastMaintenance}</div>
      </TableCell>
      <TableCell className="py-2 px-2">
        <CartActions cart={cart} onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  )
}