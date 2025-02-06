import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { CartFormValues } from "./types"

interface RfidFieldProps {
  form: UseFormReturn<CartFormValues>
  disabled?: boolean
  placeholder?: string
}

export function RfidField({ form, disabled = false, placeholder = "Enter QR code" }: RfidFieldProps) {
  return (
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
  )
}