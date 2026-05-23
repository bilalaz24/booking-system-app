"use server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function bookAppointment(formData: FormData) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const name = formData.get("name")
    const email = formData.get("email")
    const phone = formData.get("phone")
    const date = formData.get("date")
    const slot = formData.get("slot")

    supabase.from("bookings").insert({
        business_id: 
        date,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        start_time: slot,
        end_time: slot
    })

    console.log({
        name,
        email,
        date,
        slot
    })
}