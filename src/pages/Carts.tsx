import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle, QrCode, Pencil, Trash2 } from "lucide-react"
import { CartForm } from "@/components/cart-form"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Cart {
  id: string
  rfidTag: string
  store: string
  status: "active" | "maintenance" | "retired"
  lastMaintenance: string
  issues: string[]
}

const Carts = () => {
  const [carts, setCarts] = useState<Cart[]>([
    {
      id: "CART-001",
      rfidTag: "RFID-A123",
      store: "SuperMart Downtown",
      status: "active",
      lastMaintenance: "2024-02-15",
      issues: ["Wheel alignment needed"],
    },
    {
      id: "CART-002",
      rfidTag: "RFID-B456",
      store: "SuperMart Downtown",
      status: "maintenance",
      lastMaintenance: "2024-01-20",
      issues: ["Handle loose", "Left wheel damaged"],
    },
    {
      id: "CART-003",
      rfidTag: "RFID-C789",
      store: "FreshMart Heights",
      status: "active",
      lastMaintenance: "2024-02-10",
      issues: [],
    },
  ])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCart, setEditingCart] = useState<Cart | null>(null)
  const [deleteCart, setDeleteCart] = useState<Cart | null>(null)
  const { toast } = useToast()

  const getStatusBadge = (status: Cart["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "maintenance":
        return <Badge variant="destructive">Maintenance</Badge>
      case "retired":
        return <Badge variant="secondary">Retired</Badge>
    }
  }

  const handleAddCart = (data: any) => {
    const newCart: Cart = {
      id: `CART-${String(carts.length + 1).padStart(3, "0")}`,
      rfidTag: data.rfidTag,
      store: data.store,
      status: data.status,
      lastMaintenance: data.lastMaintenance,
      issues: data.issues ? [data.issues] : [],
    }
    setCarts([...carts, newCart])
    setIsAddDialogOpen(false)
    toast({
      title: "Cart Added",
      description: "New cart has been successfully added to the system.",
    })
  }

  const handleEditCart = (data: any) => {
    if (!editingCart) return
    const updatedCarts = carts.map((cart) =>
      cart.id === editingCart.id
        ? {
            ...cart,
            rfidTag: data.rfidTag,
            store: data.store,
            status: data.status,
            lastMaintenance: data.lastMaintenance,
            issues: data.issues ? [data.issues] : [],
          }
        : cart
    )
    setCarts(updatedCarts)
    setEditingCart(null)
    toast({
      title: "Cart Updated",
      description: "Cart details have been successfully updated.",
    })
  }

  const handleDeleteConfirm = () => {
    if (!deleteCart) return
    setCarts(carts.filter((cart) => cart.id !== deleteCart.id))
    setDeleteCart(null)
    toast({
      title: "Cart Deleted",
      description: "Cart has been successfully removed from the system.",
      variant: "destructive",
    })
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Cart Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Add New Cart
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogTitle>Add New Cart</DialogTitle>
            <CartForm
              onSubmit={handleAddCart}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Carts</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cart ID</TableHead>
                  <TableHead>RFID Tag</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Maintenance</TableHead>
                  <TableHead>Issues</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carts.map((cart) => (
                  <TableRow key={cart.id}>
                    <TableCell className="font-medium">{cart.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4" />
                        {cart.rfidTag}
                      </div>
                    </TableCell>
                    <TableCell>{cart.store}</TableCell>
                    <TableCell>{getStatusBadge(cart.status)}</TableCell>
                    <TableCell>{cart.lastMaintenance}</TableCell>
                    <TableCell>
                      {cart.issues.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {cart.issues.map((issue, index) => (
                            <li key={index} className="text-sm text-gray-600">
                              {issue}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm text-gray-500">No issues reported</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setEditingCart(cart)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogTitle>Edit Cart</DialogTitle>
                            {editingCart && (
                              <CartForm
                                initialData={{
                                  rfidTag: editingCart.rfidTag,
                                  store: editingCart.store,
                                  status: editingCart.status,
                                  lastMaintenance: editingCart.lastMaintenance,
                                  issues: editingCart.issues.join("\n"),
                                }}
                                onSubmit={handleEditCart}
                                onCancel={() => setEditingCart(null)}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeleteCart(cart)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteCart} onOpenChange={() => setDeleteCart(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the cart
              and remove its data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete Cart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Carts