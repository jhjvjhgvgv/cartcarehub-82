import React from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { PencilIcon, Trash2Icon } from "lucide-react"

interface Cart {
  id: string
  rfidTag: string
  store: string
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
  const getStatusBadge = (status: Cart["status"]) => {
    const statusStyles = {
      active: "bg-green-500",
      maintenance: "bg-yellow-500",
      retired: "bg-red-500",
    }

    return (
      <Badge className={`${statusStyles[status]} text-white`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="rounded-md border">
      <ScrollArea className="h-[calc(100vh-20rem)] md:h-[calc(100vh-16rem)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>RFID Tag</TableHead>
              <TableHead className="hidden md:table-cell">Store</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Last Maintenance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {carts.map((cart) => (
              <TableRow key={cart.id}>
                <TableCell className="font-medium">{cart.rfidTag}</TableCell>
                <TableCell className="hidden md:table-cell">{cart.store}</TableCell>
                <TableCell>{getStatusBadge(cart.status)}</TableCell>
                <TableCell className="hidden md:table-cell">{cart.lastMaintenance}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditCart(cart)}
                      className="hover:bg-primary-50"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteCart(cart.id)}
                      className="hover:bg-red-50"
                    >
                      <Trash2Icon className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}