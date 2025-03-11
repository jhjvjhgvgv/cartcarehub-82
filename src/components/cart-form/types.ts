
import { z } from "zod"

export const cartFormSchema = z.object({
  qr_code: z.string().min(1, "QR code is required"), // Updated from rfidTag to qr_code
  store: z.string().min(1, "Store is required"),
  status: z.enum(["active", "maintenance", "retired"]),
  lastMaintenance: z.string().optional(), // Keep this optional
  issues: z.string().optional(),
})

export type CartFormValues = z.infer<typeof cartFormSchema>
