"use server"

import { cookies } from "next/headers";
import { createClient } from "../supabase/server";


export async function completeBooking(bookingId: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase
        .from("bookings")
        .update({
            status: "complete"
        })
        .eq("id", bookingId)
    
    if (error) {
        console.error(error)
    }

    console.log("Booking successfully updated")
}

export async function missedBooking(bookingId: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase
        .from("bookings")
        .update({
            status: "missed"
        })
        .eq("id", bookingId)
    
    if (error) {
        console.error(error)
    }

    console.log("Booking successfully updated")
}