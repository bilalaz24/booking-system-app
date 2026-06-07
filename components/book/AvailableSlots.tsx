"use client"

import { Button } from "../ui/button"
import { useState } from "react"

interface SlotsProps {
  slots: string[]
  selectedDate: Date | null
  onSelectSlot: (slotId: string) => void
}

const AvailableSlots = ({ slots, selectedDate, onSelectSlot }: SlotsProps) => {
  const [selectedSlot, setSelectedSlot] = useState<string>("")

  const handleSelect = (slot: string) => {
    setSelectedSlot(slot)
  }

  const handleConfirm = () => {
    onSelectSlot(selectedSlot)
  }

  return (
    <div className="flex-1 flex flex-col items-center px-3 gap-6">
      {/* Slots */}
      <div className="w-full max-w-md">
        {slots.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {slots.map((slot) => {
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
                        ? "bg-primary text-primary-foreground ring-2 ring-primary"
                        : "bg-card text-card-foreground hover:border-barber-blue"
                    }
                  `}
                >
                  {slot}
                </Button>
              )
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">Stängt</p>
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