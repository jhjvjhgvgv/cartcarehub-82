import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { CartFormValues } from "./types"

interface RfidFieldProps {
  form: UseFormReturn<CartFormValues>
  disabled?: boolean
  placeholder?: string
}

export function RfidField({ form, disabled = false, placeholder = "Enter RFID tag" }: RfidFieldProps) {
  return (
    <FormField
      control={form.control}
      name="rfidTag"
      render={({ field }) => (
        <FormItem>
          <FormLabel>RFID Tag</FormLabel>
          <FormControl>
            <Input 
              placeholder={placeholder}
              {...field} 
              defaultValue={field.value}
              disabled={disabled}
              className={disabled ? "bg-gray-100" : ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}