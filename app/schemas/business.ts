import z from "zod"

export const businessProfileSchema = z.object({
  name: z.string().min(1).max(50),
  hero_title: z.string().min(1).max(100, "Title too long"),
  hero_description: z.string().min(1).max(500, "Description too long"),

  address: z.string().min(1),
  city: z.string().min(1),

  phone: z
    .string()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(/^[+]?[0-9\s()-]+$/, "Invalid phone number"),
  email: z.string().email("Invalid email"),

  instagram: z.string().optional().or(z.literal("")),
  facebook: z.string().optional().or(z.literal("")),
})

export type ProfileFormValues = z.infer<typeof businessProfileSchema>

// ----------------

export const businessServicesSchema = z.object({
  id: z.string().optional().or(z.literal("")),
  name: z.string().min(1, "Service name is required").max(50, "Service name is too long"),
  description: z.string().max(500, "Description is too long").optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Price must be positive"),
  duration_min: z.coerce.number().min(1, "Duration must be at least 1 minute"),
})

export const businessServicesFormSchema = z.object({
  services: z.array(businessServicesSchema),
})

export type ServicesFormValues = z.infer<typeof businessServicesFormSchema>
export type ServiceFormValues = z.infer<typeof businessServicesSchema>