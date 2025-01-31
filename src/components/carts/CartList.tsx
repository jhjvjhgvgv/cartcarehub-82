import React from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { PencilIcon, Trash2Icon } from "lucide-react"
import { useNavigate } from "react-router-dom"

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

  const getStatusBadge = (status: Cart["status"]) => {
    const statusStyles = {
      active: "bg-green-500",
      maintenance: "bg-yellow-500",
      retired: "bg-red-500",
    }

    return (
      <Badge className={`${statusStyles[status]} text-white px-4 py-1`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

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
              <TableRow 
                key={cart.id}
                onClick={(e) => handleRowClick(cart.id, e)}
                className="cursor-pointer hover:bg-muted/60 min-h-[140px] md:min-h-[60px]"
              >
                <TableCell className="font-medium">
                  <div className="flex flex-col md:flex-row items-start md:items-center">
                    {cart.rfidTag}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-col md:flex-row items-start md:items-center">
                    {cart.store}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col md:flex-row items-start md:items-center">
                    {getStatusBadge(cart.status)}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-col md:flex-row items-start md:items-center">
                    {cart.lastMaintenance}
                  </div>
                </TableCell>
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