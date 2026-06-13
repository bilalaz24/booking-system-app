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

  instagram: z.string().optional(),
  facebook: z.string().optional(),
})

export type ProfileFormValues =
  z.infer<typeof businessProfileSchema>