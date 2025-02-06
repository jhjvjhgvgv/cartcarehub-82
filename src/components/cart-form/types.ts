import { z } from "zod"

export const cartFormSchema = z.object({
  rfidTag: z.string().min(1, "QR code is required"),
  store: z.string().min(1, "Store is required"),
  status: z.enum(["active", "maintenance", "retired"]),
  lastMaintenance: z.string().min(1, "Last maintenance date is required"),
  issues: z.string().optional(),
})

export type CartFormValues = z.infer<typeof cartFormSchema>