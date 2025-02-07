
import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { RfidField } from "./cart-form/RfidField"
import { StoreField } from "./cart-form/StoreField"
import { StatusField } from "./cart-form/StatusField"
import { MaintenanceField } from "./cart-form/MaintenanceField"
import { IssuesField } from "./cart-form/IssuesField"
import { cartFormSchema, CartFormValues } from "./cart-form/types"
import { Card } from "./ui/card"
import { ShoppingCart } from "lucide-react"

interface CartFormProps {
  initialData?: CartFormValues
  onSubmit: (data: CartFormValues) => void
  onCancel: () => void
  disableRfidTag?: boolean
  isBulkEdit?: boolean
  rfidPlaceholder?: string
}

export function CartForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  disableRfidTag = false,
  isBulkEdit = false,
  rfidPlaceholder = "Enter QR code"
}: CartFormProps) {
  const form = useForm<CartFormValues>({
    resolver: zodResolver(cartFormSchema),
    defaultValues: initialData || {
      rfidTag: "",
      store: "",
      status: "active",
      lastMaintenance: new Date().toISOString().split("T")[0],
      issues: "",
    },
  })

  React.useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    }
  }, [initialData, form])

  const handleSubmit = (data: CartFormValues) => {
    const modifiedValues: Partial<CartFormValues> = {}

    Object.keys(data).forEach((key) => {
      const fieldKey = key as keyof CartFormValues
      if (initialData && data[fieldKey] !== initialData[fieldKey]) {
        if (fieldKey === 'status') {
          const status = data[fieldKey]
          if (status === 'active' || status === 'maintenance' || status === 'retired') {
            modifiedValues[fieldKey] = status
          }
        } else {
          modifiedValues[fieldKey] = data[fieldKey]
        }
      }
    })

    if (isBulkEdit || (disableRfidTag && initialData?.rfidTag)) {
      delete modifiedValues.rfidTag
    }

    onSubmit({
      ...initialData,
      ...modifiedValues,
    } as CartFormValues)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-6 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Add New Cart</h3>
              <p className="text-sm text-muted-foreground">Fill in the details below to add a new cart to the system</p>
            </div>
          </Card>
        </div>

        <Card className="p-6 space-y-6">
          <RfidField 
            form={form} 
            disabled={disableRfidTag}
            placeholder={rfidPlaceholder}
          />
          <StoreField form={form} />
          <StatusField form={form} />
          <MaintenanceField form={form} />
          <IssuesField form={form} />
        </Card>

        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
          >
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  )
}
