"use client"

import React, { useEffect, useState } from "react"
import { Calendar } from "@/components/ui/calendar"

interface CalendarProps {
  selectedService: string | null
  onSelectDate: (date: Date) => void
}

const AvailableDates = ({ onSelectDate }: CalendarProps) => {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [size, setSize] = useState<"sm" | "lg">("lg")

  // 👇 responsive size switching
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
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            return date < today
          }}
          className="w-full rounded-2xl border shadow-sm"
        />
      </div>
    </div>
  )
}

export default AvailableDates