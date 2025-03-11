
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Cart } from "@/types/cart"
import { MoreHorizontal, PencilIcon, Trash2Icon, WrenchIcon } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useLocation, useNavigate } from "react-router-dom"

interface CartActionsProps {
  cart: Cart
  onEdit: (cart: Cart) => void
  onDelete: (cartId: string) => void
}

export function CartActions({ cart, onEdit, onDelete }: CartActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const isDetailsPage = location.pathname.includes(`/carts/${cart.id}`)

  const handleMaintenanceClick = () => {
    // Update the cart's status to maintenance
    const updatedCart = {
      ...cart,
      status: "maintenance" as const
    }
    onEdit(updatedCart)
    
    toast({
      title: "Cart Status Updated",
      description: `Cart ${cart.qr_code} has been marked for maintenance.`,
    })
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit(cart)
  }
  
  const handleDeleteConfirm = () => {
    setIsDeleting(true)
    
    // Close the dialog immediately to prevent UI freeze
    setShowDeleteDialog(false)
    
    // Slight delay to allow dialog to close
    setTimeout(() => {
      onDelete(cart.id)
      
      // Don't show toast here if we're on details page - navigation will happen
      if (!isDetailsPage) {
        toast({
          title: "Success",
          description: "Cart has been removed from the system.",
        })
      }
    }, 100)
  }

  return (
    <div className="flex items-center gap-2">
      {cart.status !== "maintenance" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMaintenanceClick}
          className="hover:bg-yellow-100 hover:text-yellow-900"
          disabled={isDeleting}
        >
          <WrenchIcon className="h-4 w-4" />
        </Button>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isDeleting}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEditClick}>
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            <Trash2Icon className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
