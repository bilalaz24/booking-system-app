"use server"
import { cookies } from "next/headers";
import { createClient } from "../supabase/server";
import { bookingSchema } from "@/app/schemas/booking"
import { z } from "zod"
import { getCurrentBusiness } from "../business/getCurrentBusiness";

type BookingData = z.infer<typeof bookingSchema>

async function addMinutes(time: string, serviceId: string) {
  const [hours, minutes] = time.split(":").map(Number)

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("services")
    .select("duration_min")
    .eq("id", serviceId)
    .single()

  if (error || !data) {
    throw new Error(`Failed to fetch service duration ${error}`)
  }


  const date = new Date()
  date.setHours(hours)
  date.setMinutes(minutes + data.duration_min)

  return date.toTimeString().slice(0, 5)
}

export async function bookAppointment(data: BookingData) {
    try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

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
            phone,
            date,
            slot,
            service,
        } = data
        /*
        const name = formData.get("name")?.toString().trim()
        const email = formData.get("email")?.toString().trim()
        const phone = formData.get("phone")?.toString().trim()
        const date = formData.get("date")?.toString()
        const slot = formData.get("slot")?.toString()
        const service = formData.get("service")?.toString()*/

        if (!name || !phone || !date || !slot || !service) {
            return {
                success: false,
                error: "Missing fields"
            }
            //throw new Error("Missing fields")
        }

        const parsed = bookingSchema.safeParse(data)

        if (!parsed.success) {
            return {
                success: false,
                error: "Invalid form data",
            }
        }

        console.log({
            name,
            email,
            date,
            phone,
            slot,
            service,
        })

        const endTime = await addMinutes(slot, service)

        console.log(endTime)

        const normalizedSlot = slot.length === 5 ? `${slot}:00` : slot

        const { data: existing, error: existingError } = await supabase
            .from("bookings")
            .select("*")
            .eq("date", date)
            .eq("start_time", normalizedSlot)
            .maybeSingle()

        //const { data: existingNew, error: existingErrorNew } = await supabase
        //    .from("bookings_new")
        //    .select("*")
        //    .eq("date", date)
        //    .eq("start_time", normalizedSlot)
        //    .maybeSingle()

        if (existingError) {
            return {
                success: false,
                error: existingError?.message || "Something went wrong"
            }
            //throw new Error(existingError?.message)
        }
        if (existing) {
            return {
                success: false,
                error: "Time slot already taken"
            }
            //throw new Error("Time slot already taken")
        }


        const { error } = await supabase.from("bookings").insert({
            business_id: businessId,
            service_id: service,
            date,
            customer_name: name,
            customer_email: email,
            customer_phone: phone,
            start_time: slot,
            end_time: endTime,
            //status: "pending"
        })

        if (error) {
            console.error(error)
            return {
                success: false,
                error: error.message
            }
        }

        return {
            success: true,
            date,
            slot
        }
    } catch (error: any) {
        return {
            success: false,
            error: error?.message || "Something went wrong"
        }
    }
    
}