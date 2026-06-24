"use client"

import React, { useEffect, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { createClient } from "@/lib/supabase/client"
import { useBusiness } from "../providers/BusinessProvider"

// 1. Update the interface to accept your array of objects
interface AvailableDay {
  day_of_week: number // 0 = Monday, 6 = Sunday
  // ... any other properties your objects have
}

interface CalendarProps {
  selectedService: string | null
  onSelectDate: (date: Date) => void
}

const AvailableDates = ({ onSelectDate }: CalendarProps) => {
  const supabase = createClient()
  const {business} = useBusiness()

  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([])
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [size, setSize] = useState<"sm" | "lg">("lg")

  const fetchClosedDays = async () => {
    const { data, error } = await supabase.from("available_slots").select("day_of_week").eq("business_id", business.id)

    if (error) {
      console.error(error)
      return
    }

    console.log(data)
    setAvailableDays(data ?? [])
  }

  useEffect(() => {
    if (!business.id) return

    fetchClosedDays()
  }, [business])

  // Create a fast lookup Set of allowed day integers (e.g., [0, 1, 2, 3, 4])
  const allowedDays = new Set(availableDays.map(d => d.day_of_week))

  console.log(allowedDays)

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)")

    const updateSize = () => {
      setSize(media.matches ? "sm" : "lg")
    }

    updateSize()
    media.addEventListener("change", updateSize)

    return () => media.removeEventListener("change", updateSize)
  }, [])

  const handleSelect = (value: Date | undefined) => {
    if (!value) return
    setDate(value)
    onSelectDate(value)
  }

  return (
    <div className="flex-1 flex justify-center px-4 mb-12">
      <div className="w-full max-w-md sm:max-w-lg">
        <Calendar
          size={size}
          mode="single"
          selected={date}
          onSelect={handleSelect}
          weekStartsOn={1}
          disabled={(date) => {
            // Fix 1: Disable past dates
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            if (date < today) return true

            // Fix 2: Convert JS Day (0=Sun, 1=Mon...) to your custom Day (0=Mon, 6=Sun)
            const customDayOfWeek = (date.getDay() + 6) % 7

            // Disable the day if it isn't present in your allowedDays set
            return !allowedDays.has(customDayOfWeek)
          }}
          className="w-full rounded-2xl border shadow-sm"
        />
      </div>
    </div>
  )
}

export default AvailableDates