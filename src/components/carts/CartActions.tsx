
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Cart } from "@/types/cart"
import { MoreHorizontal, PencilIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"
import { useLocation } from "react-router-dom"
import { MaintenanceAction } from "./MaintenanceAction"
import { DeleteCartDialog } from "./DeleteCartDialog"

interface CartActionsProps {
  cart: Cart
  onEdit: (cart: Cart) => void
  onDelete: (cartId: string) => void
}

export function CartActions({ cart, onEdit, onDelete }: CartActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const location = useLocation()
  const isDetailsPage = location.pathname.includes(`/carts/${cart.id}`)

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
    }, 100)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDeleteDialog(true)
  }

  return (
    <div className="flex items-center gap-2">
      <MaintenanceAction 
        cart={cart} 
        onEdit={onEdit} 
        disabled={isDeleting} 
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isDeleting} onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={handleEditClick}>
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDeleteClick}
            className="text-red-600"
          >
            <Trash2Icon className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteCartDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  )
}
