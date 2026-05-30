import z from "zod"

export const bookingSchema = z.object({
    service: z.string().uuid().optional().or(z.literal("")),
    name: z.string().min(1, "Name is required").max(30, "Name is too long"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z
        .string()
        .min(7, "Phone number is too short")
        .max(20, "Phone number is too long")
        .regex(/^[+]?[0-9\s()-]+$/, "Invalid phone number"),
    slot: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be HH:mm"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
}).superRefine((data, ctx) => {
    const now = new Date()

    const [year, month, day] = data.date.split("-").map(Number)
    const [hour, minute] = data.slot.split(":").map(Number)

    const bookingDate = new Date(year, month - 1, day, hour, minute)

    if (bookingDate < now) {
        ctx.addIssue({
        code: "custom",
        message: "You can only book future times",
        path: ["date"],
        })
    }
})