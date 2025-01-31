import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Cart } from "./CartList"
import { CartTableRow } from "./CartTableRow"
import { useNavigate } from "react-router-dom"

interface CartListProps {
  carts: Cart[]
  onEditCart: (cart: Cart) => void
  onDeleteCart: (cartId: string) => void
}

export function CartList({ carts, onEditCart, onDeleteCart }: CartListProps) {
  const navigate = useNavigate()

  const handleRowClick = (cartId: string, event: React.MouseEvent) => {
    // Only navigate if the click target is not a button
    const target = event.target as HTMLElement
    const isButton = target.tagName === 'BUTTON' || target.closest('button')
    
    if (!isButton) {
      navigate(`/carts/${cartId}`)
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="py-4 px-4">RFID Tag</TableHead>
            <TableHead className="hidden sm:table-cell py-4 px-4">Store</TableHead>
            <TableHead className="py-4 px-4">Status</TableHead>
            <TableHead className="hidden sm:table-cell py-4 px-4">Last Maintenance</TableHead>
            <TableHead className="py-2 px-2 w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {carts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No carts found
              </TableCell>
            </TableRow>
          ) : (
            carts.map((cart) => (
              <CartTableRow
                key={cart.id}
                cart={cart}
                onEdit={onEditCart}
                onDelete={onDeleteCart}
                onClick={handleRowClick}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}