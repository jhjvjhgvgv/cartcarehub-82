import { TableCell, TableRow } from "@/components/ui/table"
import { Cart, CartWithStore, getStatusLabel } from "@/types/cart"
import { CartStatusBadge } from "./CartStatusBadge"
import { CartActions } from "./CartActions"
import { Checkbox } from "@/components/ui/checkbox"

interface CartTableRowProps {
  cart: Cart | CartWithStore
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
    const isDropdownMenu = target.closest('[role="menu"]') || target.closest('[data-radix-popper-content-wrapper]')
    
    if (!isButton && !isCheckbox && !isDropdownMenu) {
      onClick(cart.id, event)
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    onSelect(cart.id, checked)
  }

  // Get store name from CartWithStore if available
  const storeName = 'store_name' in cart ? cart.store_name : cart.store_org_id;

  return (
    <TableRow 
      onClick={handleRowClick}
      className="cursor-pointer hover:bg-muted/60"
    >
      <TableCell className="w-[60px] text-center">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => handleCheckboxChange(checked as boolean)}
          onClick={(e) => e.stopPropagation()}
        />
      </TableCell>
      <TableCell className="w-1/5">
        <div className="grid gap-1">
          <div className="font-medium font-mono">{cart.qr_token}</div>
          {cart.asset_tag && (
            <div className="text-sm text-muted-foreground">{cart.asset_tag}</div>
          )}
          <div className="sm:hidden text-sm text-muted-foreground">{storeName}</div>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell w-1/5">
        <div>{storeName}</div>
      </TableCell>
      <TableCell className="w-1/5">
        <CartStatusBadge status={cart.status} />
      </TableCell>
      <TableCell className="hidden sm:table-cell w-1/5">
        <div>{cart.model || '-'}</div>
      </TableCell>
      <TableCell className="w-[100px] text-right">
        <CartActions cart={cart} onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  )
}
