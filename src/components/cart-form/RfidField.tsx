
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { CartFormValues } from "./types"
import { QRScanner } from "./QRScanner"
import { Cart } from "@/types/cart"

interface RfidFieldProps {
  form: UseFormReturn<CartFormValues>
  disabled?: boolean
  placeholder?: string
  carts?: Cart[]
  onSubmit?: (data: any) => void
  onDelete?: (cartId: string) => void
}

export function RfidField({ 
  form, 
  disabled = false, 
  placeholder = "Enter QR code",
  carts = [],
  onSubmit = () => {},
  onDelete = () => {},
}: RfidFieldProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="rfidTag"
        render={({ field }) => (
          <FormItem>
            <FormLabel>QR Code</FormLabel>
            <FormControl>
              <Input 
                {...field}
                placeholder={placeholder}
                disabled={disabled}
                readOnly={disabled}
                className={disabled ? "bg-gray-100 cursor-not-allowed" : ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {!disabled && (
        <QRScanner
          onQRCodeDetected={(qrCode) => {
            form.setValue("rfidTag", qrCode)
          }}
          carts={carts}
          onSubmit={onSubmit}
          onDelete={onDelete}
        />
      )}
    </div>
  )
}
