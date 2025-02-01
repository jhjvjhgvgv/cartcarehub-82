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
  rfidPlaceholder = "Enter RFID tag"
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

  // Reset form when initialData changes to ensure original values are displayed
  React.useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach((key) => {
        form.setValue(key as keyof CartFormValues, initialData[key as keyof CartFormValues])
      })
    }
  }, [initialData, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <RfidField 
          form={form} 
          disabled={disableRfidTag}
          placeholder={rfidPlaceholder}
        />
        <StoreField form={form} />
        <StatusField form={form} />
        <MaintenanceField form={form} />
        <IssuesField form={form} />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Cart</Button>
        </div>
      </form>
    </Form>
  )
}