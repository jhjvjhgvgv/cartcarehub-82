import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import DashboardLayout from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Loader2 } from "lucide-react"
import { Cart } from "@/types/cart"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { mapToCart } from "@/api/mappers/cart-mapper"
import { SingleCartEdit } from "@/components/carts/SingleCartEdit"
import { useCartSubmit } from "@/hooks/cart-hooks/use-cart-submit"
import { useCartDelete } from "@/hooks/cart-hooks/use-cart-delete"
import { useToast } from "@/hooks/use-toast"

const fetchCartById = async (cartId: string): Promise<Cart | null> => {
  try {
    console.log(`Fetching cart with ID: ${cartId}`)
    const { data, error } = await supabase
      .from('carts')
      .select('*')
      .eq('id', cartId)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    if (!data) {
      console.log(`No cart found with ID: ${cartId}`)
      return null
    }
    
    console.log(`Successfully fetched cart:`, data)
    return mapToCart(data)
  } catch (error) {
    console.error('Error fetching cart by ID:', error)
    throw error
  }
}

export default function CartDetails() {
  const { cartId } = useParams<{ cartId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const { handleSubmit, isPending: isSubmitting } = useCartSubmit()
  const { handleDeleteCart, isDeleting } = useCartDelete()

  // Fetch managed stores - simplified mock for now
  const managedStores = [
    { id: "store1", name: "SuperMart Downtown" },
    { id: "store2", name: "FreshMart Heights" },
    { id: "store3", name: "Value Grocery West" },
    { id: "store4", name: "QuickStop Market" },
    { id: "store5", name: "Family Grocers" },
    { id: "store6", name: "Metro Foods" },
    { id: "store7", name: "Central Supermarket" },
    { id: "store8", name: "Riverside Groceries" },
  ]

  const {
    data: cart,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["cart", cartId],
    queryFn: () => cartId ? fetchCartById(cartId) : null,
    enabled: !!cartId,
  })

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
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Deleting cart...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading cart details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-4 text-center">
          <p className="text-red-500 mb-4">Error loading cart details</p>
          <Button onClick={() => navigate('/carts')} variant="outline">
            Back to Carts
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  if (!cart) {
    return (
      <DashboardLayout>
        <div className="p-4 text-center">
          <p className="mb-4">Cart not found</p>
          <Button onClick={() => navigate('/carts')} variant="outline">
            Back to Carts
          </Button>
        </div>
      </DashboardLayout>
    )
  }

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
            
            {!isEditing && (
              <Button onClick={handleEdit}>
                Edit Cart
              </Button>
            )}
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
            <Card>
              <CardHeader>
                <CardTitle>Cart Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">QR Code</p>
                    <p className="text-lg">{cart.qr_code}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Store</p>
                    <p className="text-lg">{cart.store}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <div className="mt-1">{getStatusBadge(cart.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Maintenance</p>
                    <p className="text-lg">{cart.lastMaintenance}</p>
                  </div>
                </div>
                {cart.issues && cart.issues.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Issues</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {cart.issues.map((issue, index) => (
                        <li key={index} className="text-gray-700">{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
