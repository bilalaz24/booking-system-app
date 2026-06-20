import z from "zod"

export const contactSchema = z.object({
  name: z.string().min(1, "Name required").max(50, "Name is too long"),
  email: z.string().email("Invalid email"),
  subject: z.string().min(1, "Subject required").max(100, "Subject is too long"),
  message: z.string().min(1, "Message required").max(3000, "Message is too long"),
})

export type ContactValues = z.infer<typeof contactSchema>