"use client"

import { Service } from "@/lib/types"
import { Button } from "../ui/button"
import { useState, useMemo } from "react"

interface SlotsProps {
  slots: string[]
  selectedService: string | null
  selectedDate: Date | null
  onSelectSlot: (slotId: string) => void
}

const AvailableSlots = ({ selectedService, slots, selectedDate, onSelectSlot }: SlotsProps) => {
  const [selectedSlot, setSelectedSlot] = useState<string>("")

  const handleSelect = (slot: string) => {
    setSelectedSlot(slot)
  }

  const handleConfirm = () => {
    onSelectSlot(selectedSlot)
  }

  const filteredSlots = useMemo(() => {
    if (!selectedDate) return []

    const nowPlus1Hour = new Date()
    nowPlus1Hour.setHours(nowPlus1Hour.getHours() + 1)

    return slots.filter((slot) => {
      const [h, m] = slot.split(":").map(Number)

      const slotTime = new Date(selectedDate)
      slotTime.setHours(h, m, 0, 0)

      return slotTime >= nowPlus1Hour
    })
  }, [slots, selectedDate])

  return (
    <div className="flex-1 flex flex-col items-center px-3 gap-6">
      {/* Slots */}
      <div className="w-full max-w-md">
        {filteredSlots.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredSlots.map((slot) => {
              const isSelected = selectedSlot === slot

              return (
                <Button
                  key={slot}
                  onClick={() => handleSelect(slot)}
                  className={`
                    transition-all
                    border
                    ${
                      isSelected
                        ? "bg-accent text-accent-foreground ring-2 ring-accent"
                        : "bg-card text-card-foreground hover:border-accent"
                    }
                  `}
                >
                  {slot}
                </Button>
              )
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">Inga tillgängliga tider</p>
        )}
      </div>

      {/* Confirm */}
      <div className="w-full max-w-md flex justify-center">
        <Button
          disabled={!selectedSlot}
          onClick={handleConfirm}
          className="w-full"
        >
          Bekräfta tid
        </Button>
      </div>
    </div>
  )
}

export default AvailableSlots