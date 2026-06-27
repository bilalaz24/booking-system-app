"use client"

import Stats from '@/components/staff/Stats'
import { fetchBookings } from '@/components/staff/Bookings'
import React, { useEffect, useState } from 'react'
import { useStaffUser } from '@/components/providers/StaffUserProvider'
import { Booking } from '@/lib/types'


const StatsPage = () => {
    const user = useStaffUser()

    const today = new Date().toISOString().split("T")[0]

    const [todaysBookings, setToday] = useState<Booking[]>()
    const [future, setFuture] = useState<Booking[]>()
    const [passed, setPassed] = useState<Booking[]>()

    const loadBookings = async () => {
        const { today: todaysBookings, future: futureBookings, passed: passedBookings } = await fetchBookings(user, today, "")

        if (!todaysBookings || !futureBookings || !passedBookings) {
            console.error("Error fetching bookings for stats")
            return
        }

        setToday(todaysBookings)
        setFuture(futureBookings)
        setPassed(passedBookings)
    }

    useEffect(() => {
        if (!user?.business_id) return
    loadBookings()
    }, [user?.business_id])

    return (
        <div>
            <Stats todayBookings={todaysBookings!} futureBookings={future!} passedBookings={passed!} />
        </div>
    )
}

export default StatsPage