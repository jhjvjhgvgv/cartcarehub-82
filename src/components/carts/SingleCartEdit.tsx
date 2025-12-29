import React from "react"
import { CartForm } from "@/components/cart-form"
import { Button } from "@/components/ui/button"
import { Trash2Icon } from "lucide-react"
import { Cart, CartWithStore } from "@/types/cart"

interface SingleCartEditProps {
  cart: Cart | CartWithStore
  onSubmit: (data: any) => void
  onCancel: () => void
  onDelete: (cartId: string) => void
  disabled?: boolean
}

export function SingleCartEdit({ cart, onSubmit, onCancel, onDelete, disabled = false }: SingleCartEditProps) {
  const handleDelete = () => {
    onDelete(cart.id)
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-8 w-8 p-0 hover:bg-red-50"
          disabled={disabled}
        >
          <Trash2Icon className="h-4 w-4 text-red-500" />
        </Button>
      </div>
      <CartForm
        initialData={{
          qr_token: cart.qr_token || "",
          store_org_id: cart.store_org_id || "",
          status: cart.status || "in_service",
          notes: cart.notes || "",
          asset_tag: cart.asset_tag || "",
          model: cart.model || "",
        }}
        onSubmit={onSubmit}
        onCancel={onCancel}
        disabled={disabled}
      />
    </div>
  )
}
