"use client"
import { Button } from '../ui/button'
import { useState } from 'react'

const AvailableSlots = ({slots}: {slots: string[]}) => {
    const [timeSlot, setTimeSlot] = useState<string>()

    const setSlot = (slot: string) => {
        setTimeSlot(slot)
    }

    return (
        <div>
            <div>
                {slots.map((slot) => (
                    <div key={slot}>
                        <Button className='bg-gray-200 text-gray-950' onClick={() => setSlot(slot)}>{slot}</Button>
                    </div>
                ))}
            </div>
            <div>
                <Button className='bg-yellow-600'>Bekräfta</Button>
            </div>
        </div>
    )
}

export default AvailableSlots