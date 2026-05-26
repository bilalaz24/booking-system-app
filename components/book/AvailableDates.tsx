"use client"
import React from 'react'
import { Calendar } from "@/components/ui/calendar"

interface CalendarProps {
  selectedService: string | null
  onSelectDate: (date: Date) => void // Or whatever signature your handler uses
}

const AvailableDates = ({selectedService, onSelectDate}: CalendarProps) => {
  const [date, setDate] = React.useState<Date | undefined>(undefined)

  const handleSelect = (value: Date | undefined) => {
    if (!value) return

    console.log(value)

    setDate(value)
    onSelectDate(value)
  }

  return (
    <div className='flex-1 flex justify-center'>
      <div>
        <Calendar
          size='lg'
          mode="single"
          selected={date}
          onSelect={handleSelect}
          className="rounded-md border"
          weekStartsOn={1}
        />
      </div>
    </div>
  )
}

export default AvailableDates