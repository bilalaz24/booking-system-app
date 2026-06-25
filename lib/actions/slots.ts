"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { Service } from "../types"

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

const toTimeString = (minutes: number) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export async function getAvailableSlots(businessId: string, date: string, service: string) {
  const supabase = createAdminClient()

  const jsDay = new Date(date + "T00:00:00").getDay()
  const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1

  const [{ data: slots, error: slotError }, { data: booked, error: bookingError }] =
    await Promise.all([
      supabase
        .from("available_slots")
        .select("start_time, end_time")
        .eq("business_id", businessId)
        .eq("day_of_week", dayOfWeek)
        .maybeSingle(),

      supabase
        .from("bookings")
        .select("start_time, end_time")
        .eq("business_id", businessId)
        .eq("date", date),
    ])

    const {data: serviceData, error} = await supabase
      .from("services")
      .select("*")
      .eq("name", service)
      .eq("business_id", businessId)
    
    console.log("SERVICE DATA", serviceData)

  if (slotError) {
    console.error("Slot error:", slotError)
    return []
  }

  if (bookingError) {
    console.error("Booking error:", bookingError)
    return []
  }

  if (!slots) return []

  const workStart = toMinutes(slots.start_time)
  const workEnd = toMinutes(slots.end_time)

  const bookedRanges = (booked ?? []).map((b) => ({
    start: toMinutes(b.start_time),
    end: toMinutes(b.end_time),
  }))

  const result: string[] = []

  const SLOT_DURATION = 30

  let current = workStart

  while (current + SLOT_DURATION <= workEnd) {
    const slotStart = current
    const slotEnd = current + SLOT_DURATION

    const overlaps = bookedRanges.some((b) => {
      return slotStart < b.end && slotEnd > b.start
    })

    if (!overlaps) {
      result.push(toTimeString(slotStart))
    }

    current += SLOT_DURATION
  }

  return result
}