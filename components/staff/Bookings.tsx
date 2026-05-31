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

const Bookings = () => {
  const supabase = createClient()
  const user = useStaffUser()

  const [bookings, setBookings] = useState<booking[] | null>(null)
  const [todayBookings, setTodayBookings] = useState<booking[] | null>(null)
  const [futureBookings, setFutureBookings] = useState<booking[] | null>(null)
  const [passedTodayBookings, setPassedTodayBookings] = useState<booking[] | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchAllBookings = async () => {
    if (!user.business_id) return

    setLoading(true)

    const today = new Date().toLocaleDateString("en-CA")

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        service:service_id (*)  
      `)
      .eq("business_id", user.business_id)
      //.eq("date", today)
      .in("status", ["confirmed", "pending"])
      .order("date", {ascending: true})
      .order("start_time", {ascending: true})

    if (error) {
      console.error("Error fetching bookings for business user", error)
    }

    setBookings(data ?? [])
    setTodayBookings((data ?? [])?.filter((b) => b.date === today))
    setFutureBookings((data ?? [])?.filter((b) => b.date !== today && !isBookingPast(b.date, b.end_time)))
    setPassedTodayBookings((data ?? []).filter((b) => isBookingPast(b.date, b.end_time)))
    setLoading(false)
    console.log(data)
  }

  useEffect(() => {
    fetchAllBookings()

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

          fetchAllBookings()
        }
      ).subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
  }, [])


  return (
    <div>
      <div>
        {(passedTodayBookings ?? []).length !== 0 && (
          <Card className='my-3'>
            <CardHeader>
              <CardTitle><h2>Behöver åtgärd</h2></CardTitle>
            </CardHeader>
            <CardContent>
              <Table className='hidden lg:table w-full'>
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
                    {(passedTodayBookings ?? []).map((booking) => (
                      <TableRow className="bg-barber-red/8 hover:bg-white/5" key={booking.id}>
                        <TableCell>{booking.service.name} - {booking.service.duration_min} min</TableCell>
                        <TableCell>{booking.date.split("-")[2]} {new Date(2026, Number(booking.date.split("-")[1]) - 1).toLocaleString("sv-SE", {month: "long"})}</TableCell>
                        <TableCell>{booking.start_time.split(":")[0]}:{booking.start_time.split(":")[1]}</TableCell>
                        <TableCell>{booking.end_time.split(":")[0]}:{booking.end_time.split(":")[1]}</TableCell>
                        <TableCell>{booking.customer_name}</TableCell>
                        <TableCell>{booking.customer_email}</TableCell>
                        <TableCell>{booking.customer_phone}</TableCell>
                        <TableCell>{booking.notes}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button>Välj</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => completeBooking(booking.id)}><CalendarCheck /> Slutförd</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => missedBooking(booking.id)}><CalendarX /> Missad tid</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              
              {(passedTodayBookings ?? []).map((booking) => (
                  <Card key={booking.id} className='lg:hidden'>
                    <CardContent>
                      <div className='pb-4 font-semibold'>
                        <p>
                          {booking.service.name} - {booking.service.duration_min} min
                        </p>
                      </div>
                      <div className='grid sm:grid-cols-3 xs:grid-cols-2 grid-col-1 gap-4 text-sm'>
                        <div className='py-2'>
                          <p className='text-muted-foreground'>Datum</p>
                          <p>{booking.date.split("-")[2]} {new Date(2026, Number(booking.date.split("-")[1]) - 1).toLocaleString("sv-SE", {month: "long"})}</p>
                        </div>
                        <div className=''>
                          <p className='text-muted-foreground'>Tid</p>
                          <p>{booking.start_time.slice(0, 5)}</p>
                        </div>
                        <div className='py-2'>
                          <p className='text-muted-foreground'>Kund</p>
                          <p>{booking.customer_name}</p>
                        </div>
                        <div className='py-2'>
                          <p className='text-muted-foreground'>Telefon</p>
                          <p>{booking.customer_phone}</p>
                        </div>
                        {booking.customer_email && (
                          <div>
                            <p className='text-muted-foreground text-sm'>Mail</p>
                            <p className='text-sm'>{booking.customer_email}</p>
                          </div>
                        )}
                        {booking.notes && (
                          <div>
                            <p className='text-muted-foreground text-sm'>Övrigt</p>
                            <p className='text-sm'>{booking.notes}</p>
                          </div>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className='w-[50%]' disabled={
                              !passedTodayBookings?.some((b) => b.id === booking.id)
                            }>Välj</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => completeBooking(booking.id)}><CalendarCheck /> Slutförd</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => missedBooking(booking.id)}><CalendarX /> Missad tid</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </CardContent>
          </Card>
        )}
        <Card className='my-3'>
          <CardHeader>
            <CardTitle><h2>Dagens tider</h2></CardTitle>
          </CardHeader>
          <CardContent>
            <Table className='hidden lg:table w-full'>
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
                {(todayBookings ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className='text-center pt-8 pb-4 text-muted-foreground text-lg'>
                      Inga bokningar
                    </TableCell>
                  </TableRow>
                ) : (
                  (todayBookings ?? []).map((booking) => (
                    <TableRow className={
                        passedTodayBookings?.some((b) => b.id === booking.id)
                        ? "bg-barber-red/8 hover:bg-white/5" : ""
                      } key={booking.id}>
                      <TableCell>{booking.service.name} - {booking.service.duration_min} min</TableCell>
                      <TableCell>{booking.date.split("-")[2]} {new Date(2026, Number(booking.date.split("-")[1]) - 1).toLocaleString("sv-SE", {month: "long"})}</TableCell>
                      <TableCell>{booking.start_time.split(":")[0]}:{booking.start_time.split(":")[1]}</TableCell>
                      <TableCell>{booking.end_time.split(":")[0]}:{booking.end_time.split(":")[1]}</TableCell>
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
            {(todayBookings ?? []).length === 0 ? (
              <p className='lg:hidden text-muted-foreground'>Inga bokningar</p>
            ) : (
              (todayBookings ?? []).map((booking) => (
                <Card key={booking.id} className='lg:hidden'>
                  <CardContent>
                    <div className='pb-4 font-semibold'>
                      <p>
                        {booking.service.name} - {booking.service.duration_min} min
                      </p>
                    </div>
                    <div className='grid sm:grid-cols-3 xs:grid-cols-2 grid-col-1 gap-4 text-sm'>
                      <div className='py-2'>
                        <p className='text-muted-foreground'>Datum</p>
                        <p>{booking.date.split("-")[2]} {new Date(2026, Number(booking.date.split("-")[1]) - 1).toLocaleString("sv-SE", {month: "long"})}</p>
                      </div>
                      <div className=''>
                        <p className='text-muted-foreground'>Tid</p>
                        <p>{booking.start_time.slice(0, 5)}</p>
                      </div>
                      <div className='py-2'>
                        <p className='text-muted-foreground'>Kund</p>
                        <p>{booking.customer_name}</p>
                      </div>
                      <div className='py-2'>
                        <p className='text-muted-foreground'>Telefon</p>
                        <p>{booking.customer_phone}</p>
                      </div>
                      {booking.customer_email && (
                        <div>
                          <p className='text-muted-foreground text-sm'>Mail</p>
                          <p className='text-sm'>{booking.customer_email}</p>
                        </div>
                      )}
                      {booking.notes && (
                        <div>
                          <p className='text-muted-foreground text-sm'>Övrigt</p>
                          <p className='text-sm'>{booking.notes}</p>
                        </div>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className='w-[50%]' disabled={
                            !passedTodayBookings?.some((b) => b.id === booking.id)
                          }>Välj</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => completeBooking(booking.id)}><CalendarCheck /> Slutförd</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => missedBooking(booking.id)}><CalendarX /> Missad tid</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
        <Card className='my-3'>
          <CardHeader>
            <CardTitle><h2>Kommande bokningar</h2></CardTitle>
          </CardHeader>
          <CardContent>
            <Table className='hidden lg:table w-full'>
              <TableHeader>
                <TableRow>
                  <TableHead>Tjänst</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>Slut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(futureBookings ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className='text-center pt-8 pb-4 text-muted-foreground text-lg'>
                      Inga bokningar
                    </TableCell>
                  </TableRow>
                ) : (
                  (futureBookings ?? []).map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.service.name} - {booking.service.duration_min} min</TableCell>
                      <TableCell>{booking.date.split("-")[2]} {new Date(2026, Number(booking.date.split("-")[1]) - 1).toLocaleString("sv-SE", {month: "long"})}</TableCell>
                      <TableCell>{booking.start_time.split(":")[0]}:{booking.start_time.split(":")[1]}</TableCell>
                      <TableCell>{booking.end_time.split(":")[0]}:{booking.end_time.split(":")[1]}</TableCell>
                    </TableRow>
                  )))}
              </TableBody>
            </Table>
            {(futureBookings ?? []).length === 0 ? (
              <p className='lg:hidden text-muted-foreground'>Inga bokningar</p>
            ) : (
              (futureBookings ?? []).map((booking) => (
                <Card key={booking.id} className='lg:hidden'>
                  <CardContent>
                    <div className='pb-4 font-semibold'>
                      <p>
                        {booking.service.name} - {booking.service.duration_min} min
                      </p>
                    </div>
                    <div className='grid sm:grid-cols-3 xs:grid-cols-2 grid-col-1 gap-4 text-sm'>
                      <div className='py-2'>
                        <p className='text-muted-foreground'>Datum</p>
                        <p>{booking.date.split("-")[2]} {new Date(2026, Number(booking.date.split("-")[1]) - 1).toLocaleString("sv-SE", {month: "long"})}</p>
                      </div>
                      <div className=''>
                        <p className='text-muted-foreground'>Tid</p>
                        <p>{booking.start_time.slice(0, 5)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>
        
    </div>
  )
}

export default Bookings