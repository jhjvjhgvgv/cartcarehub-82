import React from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
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
    // Check if the click was on a button (edit or delete)
    const isButton = (event.target as HTMLElement).closest('button')
    if (!isButton) {
      navigate(`/carts/${cartId}`)
    }
  }

  return (
    <div className="rounded-md border">
      <ScrollArea className="min-h-[300px] max-h-[calc(100vh-16rem)] md:max-h-[calc(100vh-12rem)]">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-[180px] min-w-[150px] lg:w-[30%]">RFID Tag</TableHead>
              <TableHead className="hidden sm:table-cell w-[180px] min-w-[150px] lg:w-[30%]">Store</TableHead>
              <TableHead className="w-[120px] min-w-[100px] lg:w-[20%]">Status</TableHead>
              <TableHead className="hidden sm:table-cell w-[180px] min-w-[150px]">Last Maintenance</TableHead>
              <TableHead className="w-[70px] min-w-[60px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {carts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
      </ScrollArea>
    </div>
  )
}