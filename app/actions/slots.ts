"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function getAvailableSlots(businessId: string, date: string) {
    const supabase = createAdminClient()

    const jsDay = new Date(date).getDay()

    const dayOfWeek = jsDay === 0 ? 7 : jsDay

    console.log(businessId, date, dayOfWeek)

    const [{ data: slots, error: slotError}, { data: booked, error: bookingError }] = await Promise.all([
        supabase
            .from("available_slots")
            .select("start_time, end_time")
            .eq("business_id", businessId)
            .eq("day_of_week", dayOfWeek)
            .single(),
        
        supabase
            .from("bookings")
            .select("start_time, end_time")
            .eq("business_id", businessId)
            .eq("date", date)
    ])

    if (slotError) {
    console.error("Slot error:", JSON.stringify(slotError, null, 2))
    }

    if (bookingError) {
    console.error("Booking error:", JSON.stringify(bookingError, null, 2))
    }

    console.log(slots)
    console.log(booked)

    const [startH, startM] = slots?.start_time.split(":").map(Number)
    const [endH, endM] = slots?.end_time.split(":").map(Number)

    let start = startH * 60 + startM
    const end = endH * 60 + endM

    const result: string[] = []

    while (start < end) {
        const h = Math.floor(start / 60)
        const m = start % 60

        const formatted = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
        result.push(formatted)

        start  += 30
    }

    console.log(result)

    //const bookedTimes = new Set(booked.map(b => b.start_time))
    //const available = slots.filter(s => !bookedTimes.has(s.start_time))

    return result
}