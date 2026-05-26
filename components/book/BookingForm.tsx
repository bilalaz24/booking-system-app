"use client"
import React, { useEffect, useRef, useState } from 'react'
import AvailableSlots from './AvailableSlots'
import AvailableDates from './AvailableDates'
import { getAvailableSlots } from '@/lib/actions/slots' // Import your existing action
import ContactInfo from './ContactInfo'
import Services from './Services'

// 1. Accept the initial server-fetched slots as a prop
const BookingForm = ({ initialSlots, initialDate, businessId }: { initialSlots: string[], initialDate: Date, businessId: string }) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate)
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const [selectedService, setSelectedService] = useState<string | null>(null)

    const [slots, setSlots] = useState<string[]>(initialSlots)
    const [loadingSlots, setLoadingSlots] = useState(false)   
    
    const handleServiceSelect = (serviceId: string) => {
        console.log(serviceId)
        setSelectedService(serviceId)
    }

    const handleSlotSelect = (slot: string) => {
        setSelectedSlot(slot)
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

            console.log("from bookingform", date)
            
            // Format to safely match YYYY-MM-DD format without timezone issues
            const formattedDate = date.toLocaleDateString('en-CA')

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
        <div className="space-y-6 flex-col justify-center">
            <Services onSelectService={handleServiceSelect} />

            <div className={`text-center border border-b-muted rounded-2xl py-8 ${/*
                selectedService != null
                ? "shadow-[0_0_8px_rgba(255,255,255,0.9),0_0_25px_rgba(255,255,255,0.5),inset_0_0_10px_rgba(255,255,255,0.2)]"
                : ""
            */""}`}>
                <h2 className='text-xl mb-4'>Välj en tid</h2>
                <div className='md:flex justify-between'>
                    <AvailableDates selectedService={selectedService} onSelectDate={handleDateSelect} />
                    
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
                </div>
            </div>

            <ContactInfo selectedDate={selectedDate} selectedSlot={selectedSlot} selectedService={selectedService} />
        </div>
    )
}

export default BookingForm