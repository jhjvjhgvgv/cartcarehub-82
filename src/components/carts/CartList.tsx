import { useState, useCallback } from "react"
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table"
import { Cart } from "@/types/cart"
import { CartTableRow } from "./CartTableRow"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface CartListProps {
  carts: Cart[]
  onEditCart: (cart: Cart) => void
  onDeleteCart: (cartId: string) => void
  onEditMultiple: (carts: Cart[]) => void
}

export function CartList({ carts, onEditCart, onDeleteCart, onEditMultiple }: CartListProps) {
  const navigate = useNavigate()
  const [selectedCarts, setSelectedCarts] = useState<string[]>([])

  const handleRowClick = useCallback((cartId: string, event: React.MouseEvent) => {
    const target = event.target as HTMLElement
    const isButton = target.tagName === 'BUTTON' || target.closest('button')
    
    if (!isButton) {
      navigate(`/carts/${cartId}`)
    }
  }, [navigate])

  const handleSelectAll = useCallback((checked: boolean) => {
    setSelectedCarts(prevSelected => checked ? carts.map(cart => cart.id) : [])
  }, [carts])

  const handleSelectCart = useCallback((cartId: string, selected: boolean) => {
    setSelectedCarts(prevSelected => selected 
      ? [...prevSelected, cartId]
      : prevSelected.filter(id => id !== cartId)
    )
  }, [])

  const handleEditSelected = useCallback(() => {
    const selectedCartObjects = carts.filter(cart => selectedCarts.includes(cart.id))
    onEditMultiple(selectedCartObjects)
  }, [carts, selectedCarts, onEditMultiple])

  return (
    <div>
      {selectedCarts.length > 0 && (
        <div className="mb-4 p-4 bg-muted rounded-lg flex items-center justify-between">
          <span>{selectedCarts.length} carts selected</span>
          <Button onClick={handleEditSelected}>
            Edit Selected
          </Button>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] text-center">
                <Checkbox
                  checked={selectedCarts.length === carts.length && carts.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-1/5">QR Code</TableHead>
              <TableHead className="hidden sm:table-cell w-1/5">Store</TableHead>
              <TableHead className="w-1/5">Status</TableHead>
              <TableHead className="hidden sm:table-cell w-1/5">Last Maintenance</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {carts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
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
                  isSelected={selectedCarts.includes(cart.id)}
                  onSelect={handleSelectCart}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
