"use client"
import { Button } from '../ui/button'
import { useState } from 'react'

interface SlotsProps {
  slots: string[]
  selectedDate: Date | null
  onSelectSlot: (slotId: string) => void // Or whatever signature your handler uses
}

const AvailableSlots = ({slots, selectedDate, onSelectSlot}: SlotsProps) => {
    const [slot, setSlot] = useState<string>("")

    console.log(slots)

    const handleSelect = () => {
        onSelectSlot(slot)
        console.log(slot)
    }

    return (
        <div className='flex-1 flex justify-center'>
            <div>
                {slots.length > 0 ? (
                    <div>
                        {slots.map((slot) => (
                            <div key={slot}>
                                <Button className='bg-card text-card-foreground' onClick={() => setSlot(slot)}>{slot}</Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Stängt</p>
                )}
            </div>
            <div>
                <Button disabled={slot == ""} onClick={handleSelect} >Bekräfta</Button>
            </div>
        </div>
    )
}

export default AvailableSlots