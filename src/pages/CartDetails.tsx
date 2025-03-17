
import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import DashboardLayout from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, QrCode } from "lucide-react"
import { SingleCartEdit } from "@/components/carts/SingleCartEdit"
import { useCartSubmit } from "@/hooks/cart-hooks/use-cart-submit"
import { useCartDelete } from "@/hooks/cart-hooks/use-cart-delete"
import { useFetchCartById } from "@/hooks/cart-hooks/use-fetch-cart-by-id"
import { CartDetailView } from "@/components/carts/CartDetailView"
import { CartLoading } from "@/components/carts/CartLoading"
import { CartError } from "@/components/carts/CartError"
import { managedStores } from "@/constants/stores"
import { CartQRCode } from "@/components/carts/CartQRCode"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function CartDetails() {
  const { cartId } = useParams<{ cartId: string }>()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false)
  const { handleSubmit, isPending: isSubmitting } = useCartSubmit()
  const { handleDeleteCart, isDeleting } = useCartDelete()

  const {
    data: cart,
    isLoading,
    error,
    refetch
  } = useFetchCartById(cartId)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleFormSubmit = (data: any) => {
    if (!cart) return

    handleSubmit({
      data,
      editingCart: cart,
      managedStores
    })
    setIsEditing(false)
  }

  const handleDelete = (cartId: string) => {
    // Don't navigate here - let the hook handle navigation
    handleDeleteCart(cartId)
    // Don't show toast here - will be handled after navigation
  }

  // If we're deleting, show a loading state to prevent UI freeze
  if (isDeleting) {
    return (
      <DashboardLayout>
        <CartLoading message="Deleting cart..." />
      </DashboardLayout>
    )
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <CartLoading />
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <CartError />
      </DashboardLayout>
    )
  }

  if (!cart) {
    return (
      <DashboardLayout>
        <CartError message="Cart not found" />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate('/carts')}
                className="bg-primary-50 hover:bg-primary-100 text-primary-800 font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 shadow-sm hover:shadow focus:ring-2 focus:ring-primary-200 focus:outline-none"
                variant="ghost"
              >
                <ChevronLeft className="h-5 w-5" />
                Back to Carts
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Cart Details</h1>
            </div>
            
            <div className="flex gap-2">
              {!isEditing && (
                <>
                  <Button 
                    onClick={() => setIsQRDialogOpen(true)}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <QrCode className="h-4 w-4" />
                    View QR Code
                  </Button>
                  <Button onClick={handleEdit}>
                    Edit Cart
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Cart</CardTitle>
              </CardHeader>
              <CardContent>
                <SingleCartEdit
                  cart={cart}
                  onSubmit={handleFormSubmit}
                  onCancel={handleCancel}
                  onDelete={handleDelete}
                  disabled={isSubmitting || isDeleting}
                />
              </CardContent>
            </Card>
          ) : (
            <CartDetailView cart={cart} onEdit={handleEdit} />
          )}
        </div>
      </div>

      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cart QR Code</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <CartQRCode cart={cart} />
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
