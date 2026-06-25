"use client"

import React, { useRef, useState } from "react"
import AvailableSlots from "./AvailableSlots"
import AvailableDates from "./AvailableDates"
import { getAvailableSlots } from "@/lib/actions/slots"
import ContactInfo from "./ContactInfo"
import Services from "./Services"

const BookingForm = ({
  initialSlots,
  initialDate,
  businessId,
}: {
  initialSlots: string[]
  initialDate: Date
  businessId: string
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)

  const [slots, setSlots] = useState<string[]>(initialSlots)
  const [loadingSlots, setLoadingSlots] = useState(false)

  const calendarRef = useRef<HTMLDivElement | null>(null)
  const contactRef = useRef<HTMLDivElement | null>(null)

  // FIXED
  const handleServiceSelect = async (serviceId: string) => {
    setSelectedService(serviceId)

    const date = selectedDate ?? initialDate
    const formattedDate = date.toLocaleDateString("en-CA")

    setLoadingSlots(true)

    try {
      const newSlots = await getAvailableSlots(
        businessId,
        formattedDate,
        serviceId // IMPORTANT: use direct value, not state
      )

      setSlots(newSlots)
    } catch (err) {
      console.error("Kunde inte hämta tider:", err)
    } finally {
      setLoadingSlots(false)
    }

    setTimeout(() => {
      calendarRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }, 100)
  }

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot)
  }

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    setLoadingSlots(true)

    const formattedDate = date.toLocaleDateString("en-CA")

    try {
      const newSlots = await getAvailableSlots(
        businessId,
        formattedDate,
        selectedService
      )

      setSlots(newSlots)
    } catch (err) {
      console.error("Kunde inte hämta tider:", err)
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleConfirmSlot = () => {
    setTimeout(() => {
      contactRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }, 150)
  }

  return (
    <div className="space-y-10 flex flex-col items-center w-full">

      {/* SERVICES */}
      <div className="w-full max-w-4xl">
        <Services onSelectService={handleServiceSelect} />
      </div>

      {/* CALENDAR + SLOTS */}
      <div ref={calendarRef} className="w-full max-w-4xl p-6 text-center">
        <h2 className="text-2xl font-semibold mb-6">Välj en tid</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

          <div className="flex justify-center">
            <AvailableDates
              selectedService={selectedService}
              onSelectDate={handleDateSelect}
            />
          </div>

          <div className="flex justify-center">
            {loadingSlots ? (
              <p className="text-sm text-gray-500">Laddar tider...</p>
            ) : (
              <AvailableSlots
                slots={slots}
                selectedService={selectedService}
                selectedDate={selectedDate || initialDate}
                onSelectSlot={(slot) => {
                  handleSlotSelect(slot)
                  handleConfirmSlot()
                }}
              />
            )}
          </div>

        </div>
      </div>

      {/* CONTACT */}
      <div ref={contactRef} className="w-full max-w-4xl">
        <ContactInfo
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          selectedService={selectedService}
        />
      </div>

    </div>
  )
}

export default BookingForm