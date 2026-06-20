"use server"

import { contactSchema, ContactValues } from "@/app/schemas/contact"
import { getCurrentBusiness } from "../business/getCurrentBusiness"
import { cookies } from "next/headers"
import { createClient } from "../supabase/server"

export async function sendContactMessage(data: ContactValues) {
    console.log("SERVER ACTION STARTED")
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    console.log("Received contact message:", data)
    
    const { business } = await getCurrentBusiness()
    const businessId = business?.id
    
    if (!businessId) {
        return {
            success: false,
            error: "Business not found",
        }
    }
    

    const {
        name,
        email,
        message,
        subject,
    } = data

    if (!name || !email || !message || !subject) {
        return {
            success: false,
            error: "Missing fields"
        }
    }

    const parsed = contactSchema.safeParse(data)

    if (!parsed.success) {
        return {
            success: false,
            error: "Invalid form data",
        }
    }

    const { error } = await supabase.from("messages").insert({
        business_id: businessId,
        name,
        email,
        subject,
        message,
        status: "new",
    })

    if (error) {
        console.error("Error inserting message:", error)
        return {
            success: false,
            error: "Failed to send message",
        }
    }

    return {
        success: true,
    }
}