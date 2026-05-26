import z from "zod"

export const authSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password too short").max(30, "Password too long"),
})