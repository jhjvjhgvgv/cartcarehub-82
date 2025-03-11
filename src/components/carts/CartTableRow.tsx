
import { TableCell, TableRow } from "@/components/ui/table"
import { Cart } from "@/types/cart"
import { CartStatusBadge } from "./CartStatusBadge"
import { CartActions } from "./CartActions"
import { Checkbox } from "@/components/ui/checkbox"

interface CartTableRowProps {
  cart: Cart
  onEdit: (cart: Cart) => void
  onDelete: (cartId: string) => void
  onClick: (cartId: string, event: React.MouseEvent) => void
  isSelected: boolean
  onSelect: (cartId: string, selected: boolean) => void
}

export function CartTableRow({ 
  cart, 
  onEdit, 
  onDelete, 
  onClick,
  isSelected,
  onSelect 
}: CartTableRowProps) {
  const handleRowClick = (event: React.MouseEvent) => {
    // Only trigger click if not clicking on actions or checkbox
    const target = event.target as HTMLElement
    const isButton = target.tagName === 'BUTTON' || target.closest('button')
    const isCheckbox = target.tagName === 'INPUT' || target.closest('[role="checkbox"]')
    if (!isButton && !isCheckbox) {
      onClick(cart.id, event)
    }
  }

  return (
    <TableRow 
      onClick={handleRowClick}
      className="cursor-pointer hover:bg-muted/60"
    >
      <TableCell className="w-[50px]">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(cart.id, checked as boolean)}
        />
      </TableCell>
      <TableCell className="py-4 px-4">
        <div className="grid gap-1">
          <div className="font-medium">{cart.qr_code}</div>
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
      <TableCell className="py-2 px-2 w-[100px]">
        <CartActions cart={cart} onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  )
}
