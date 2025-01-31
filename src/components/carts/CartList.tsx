import React from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNavigate } from "react-router-dom"
import { CartTableRow } from "./CartTableRow"

export interface Cart {
  id: string
  rfidTag: string
  store: string
  storeId: string
  status: "active" | "maintenance" | "retired"
  lastMaintenance: string
  issues: string[]
}

interface CartListProps {
  carts: Cart[]
  onEditCart: (cart: Cart) => void
  onDeleteCart: (cartId: string) => void
}

export function CartList({ carts, onEditCart, onDeleteCart }: CartListProps) {
  const navigate = useNavigate()

  const handleRowClick = (cartId: string, event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('button')) {
      return
    }
    navigate(`/carts/${cartId}`)
  }

  return (
    <div className="rounded-md border">
      <ScrollArea className="h-[calc(100vh-20rem)] md:h-[calc(100vh-16rem)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20%]">RFID Tag</TableHead>
              <TableHead className="hidden md:table-cell w-[25%]">Store</TableHead>
              <TableHead className="w-[25%]">Status</TableHead>
              <TableHead className="hidden md:table-cell w-[20%]">Last Maintenance</TableHead>
              <TableHead className="text-right w-[10%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {carts.map((cart) => (
              <CartTableRow
                key={cart.id}
                cart={cart}
                onEdit={onEditCart}
                onDelete={onDeleteCart}
                onClick={handleRowClick}
              />
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}