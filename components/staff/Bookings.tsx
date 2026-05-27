"use client"

import { useStaffUser } from '../providers/StaffUserProvider'
import React, { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Item, ItemActions, ItemContent, ItemTitle } from '../ui/item'
import { Button } from '../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { CalendarCheck, CalendarX, Loader2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { completeBooking, missedBooking } from '@/lib/actions/staffBookings'

interface service {
  id: string,
  created_at: string,
  name: string,
  description: string,
  price: number,
  duration_min: number,
  business_id: string,
  business_user_id: string
}

interface booking {
  id: string,
  business_id: string,
  business_user_id: string | null,
  created_at: string,
  customer_email: string | null,
  customer_name: string,
  customer_phone: string,
  date: string,
  notes: string | null,
  service_id: string,
  start_time: string,
  end_time: string,
  status: string

  service: service
}

export function isBookingPast(date: string, time: string) {
  const [y, m, d] = date.split("-");
  const [h, min] = time.split(":");

  const bookingTime = new Date(
    Number(y),
    Number(m) - 1,
    Number(d),
    Number(h),
    Number(min)
  );

  return bookingTime < new Date();
}

const Overview = () => {
  const supabase = createClient()
  const user = useStaffUser()

  const [bookings, setBookings] = useState<booking[] | null>(null)
  const [passedTodayBookings, setPassedTodayBookings] = useState<booking[] | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchTodayBookings = async () => {
    setLoading(true)

    const today = new Date().toLocaleDateString("en-CA")

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        service:service_id (*)  
      `)
      .eq("business_id", user.business_id)
      .eq("date", today)
      .in("status", ["confirmed", "pending"])

    if (error) {
      console.error("Error fetching bookings for business user", error)
    }

    setBookings(data ?? [])
    setPassedTodayBookings((data ??[]).filter((b) => isBookingPast(b.date, b.end_time)))
    setLoading(false)
    console.log(data)
  }

  useEffect(() => {
    fetchTodayBookings()

    const channel = supabase
      .channel("bookings-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings"
        },
        (payload) => {
          console.log("Change received:", payload)

          fetchTodayBookings()
        }
      ).subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
  }, [])


  return (
    <div>
        <Card className='my-3'>
          <CardHeader>
            <CardTitle><h2>Dagens tider</h2></CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tjänst</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>Slut</TableHead>
                  <TableHead>Kund Namn</TableHead>
                  <TableHead>Kund Mail</TableHead>
                  <TableHead>Kund Telefon</TableHead>
                  <TableHead>Övrigt</TableHead>
                  <TableHead>Avklara</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className='text-center pt-8 pb-4 text-muted-foreground text-lg'>
                      Inga bokningar
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings?.map((booking) => (
                    <TableRow className={
                        passedTodayBookings?.some((b) => b.id === booking.id)
                        ? "bg-barber-red/8 hover:bg-white/5" : ""
                      } key={booking.id}>
                      <TableCell>{booking.service.name} - {booking.service.duration_min} min</TableCell>
                      <TableCell>{booking.date}</TableCell>
                      <TableCell>{booking.start_time}</TableCell>
                      <TableCell>{booking.end_time}</TableCell>
                      <TableCell>{booking.customer_name}</TableCell>
                      <TableCell>{booking.customer_email}</TableCell>
                      <TableCell>{booking.customer_phone}</TableCell>
                      <TableCell>{booking.notes}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button disabled={
                              !passedTodayBookings?.some((b) => b.id === booking.id)
                            }>Välj</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => completeBooking(booking.id)}><CalendarCheck /> Slutförd</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => missedBooking(booking.id)}><CalendarX /> Missad tid</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
    </div>
  )
}

export default Overview