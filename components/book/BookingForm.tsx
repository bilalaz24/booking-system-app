"use client"
import React, { useEffect, useRef, useState } from 'react'
import AvailableSlots from './AvailableSlots'
import AvailableDates from './AvailableDates'
import { getAvailableSlots } from '@/app/actions/slots' // Import your existing action
import ContactInfo from './ContactInfo'

// 1. Accept the initial server-fetched slots as a prop
const BookingForm = ({ initialSlots, initialDate, businessId }: { initialSlots: string[], initialDate: Date, businessId: string }) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate)
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const [slots, setSlots] = useState<string[]>(initialSlots)
    const [loadingSlots, setLoadingSlots] = useState(false)   

    const hasLoaded = useRef(false)
    
    /*useEffect(() => {
        if (hasLoaded.current) return
        hasLoaded.current = true

        handleDateSelect(new Date())
    }, [])
*/
    const handleSlotSelect = (slotId: string) => {
        setSelectedSlot(slotId)
    }

    // 3. Trigger this whenever a new date is clicked
    const handleDateSelect = async (date: Date) => {
        setSelectedDate(date)
        setSelectedSlot(null) // Clear previous slot selection
        setLoadingSlots(true)

        try {
            if (!businessId) {
                console.error("No business found")
                return
            }
            
            // Format to safely match YYYY-MM-DD format without timezone issues
            const formattedDate = date.toISOString().split("T")[0]

            // Call your EXACT server action directly from the client!
            const newSlots = await getAvailableSlots(businessId!, formattedDate)

            setSlots(newSlots)
        } catch (err) {
            console.error("Kunde inte hämta tider:", err)
        } finally {
            setLoadingSlots(false)
        }
    }

    return (
        <div className="space-y-6 flex justify-between">
            <AvailableDates selectedDate={selectedDate} onSelectDate={handleDateSelect} />
            
            {loadingSlots ? (
                <div className='flex-1 flex justify-center'>
                    <p className="text-center text-sm text-gray-500">Laddar tider...</p>
                </div>
            ) : (
                <AvailableSlots 
                    slots={slots} 
                    selectedDate={selectedDate || new Date()} 
                    onSelectSlot={handleSlotSelect} 
                />
            )}

            <ContactInfo selectedDate={selectedDate} selectedSlot={selectedSlot} />
        </div>
    )
}

export default BookingForm