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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface Service {
  id: string,
  created_at: string,
  name: string,
  description: string,
  price: number,
  duration_min: number,
  business_id: string,
  business_user_id: string
}

interface Booking {
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

  service: Service
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

  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [todayBookings, setTodayBookings] = useState<Booking[] | null>(null)
  const [futureBookings, setFutureBookings] = useState<Booking[] | null>(null)
  const [passedBookings, setPassedBookings] = useState<Booking[] | null>(null)

  const [statusMap, setStatusMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split("T")[0]

/*
  const fetchAllBookings = async () => {
    if (!user.business_id) return

    setLoading(true)

    const today = new Date().toISOString().split("T")[0]

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
    setPassedBookings((data ?? []).filter((b) => isBookingPast(b.date, b.end_time)))
    setLoading(false)
    console.log(data)
  }*/

  const fetchToday = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, service:service_id(*)")
      .eq("business_id", user.business_id)
      .eq("date", today)
      .in("status", ["confirmed", "pending"])
      .order("start_time", { ascending: true })
    
    if (error) {
      console.error(error)
    }

    setTodayBookings(data ?? [])
  }

  const fetchFuture = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, service:service_id(*)")
      .eq("business_id", user.business_id)
      .gt("date", today)
      .in("status", ["confirmed", "pending"])
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })
    
    if (error) {
      console.error(error)
    }

    setFutureBookings(data ?? [])
  }

  const fetchPassed = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, service:service_id(*)")
      .eq("business_id", user.business_id)
      .or(
        `date.lt.${today},and(date.eq.${today},end_time.lt.${new Date().toTimeString().slice(0,8)})`
      )
      //.in("status", ["confirmed", "pending"])
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })
    
    if (error) {
      console.error(error)
    }

    console.log(data)
    setPassedBookings(data ?? [])
  }

  const cleanUp = async () => {
    const lastRun = localStorage.getItem("cleanup_last_run")
    const now = Date.now()

    if (!lastRun || now - Number(lastRun) > 1000 * 60 * 60) {
      try {
        await fetch("/api/cron/bookings")
        localStorage.setItem("cleanup_last_run", String(now))
      } catch (error) {
        console.error("Cleanup failed", error)
      }
    }
  }

  const updateStatus = (id: string, value: string) => {
    setStatusMap((prev) => ({
      ...prev,
      [id]: value
    }))
  }

  useEffect(() => {
    if (!passedBookings) return

    const initial = Object.fromEntries(
      passedBookings?.map((b) => [b.id, b.status])
    )

    setStatusMap(initial)
  }, [passedBookings])

  useEffect(() => {
    if (!user.business_id) return
    
    const init = async () => {
      setLoading(true)
      await cleanUp()
      await Promise.all([fetchToday(), fetchFuture(), fetchPassed()])
      //fetchAllBookings()
      setLoading(false)
    }

    init()

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

          //fetchAllBookings()
        }
      ).subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
  }, [user.business_id])


  return (
    <div>
      <div> 

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
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className='text-center pt-8 pb-4 text-muted-foreground text-lg'>
                      Laddar bokningar
                    </TableCell>
                  </TableRow>
                ) : (todayBookings ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className='text-center pt-8 pb-4 text-muted-foreground text-lg'>
                      Inga bokningar
                    </TableCell>
                  </TableRow>
                ) : (
                  (todayBookings ?? []).map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.service.name} - {booking.service.duration_min} min</TableCell>
                      <TableCell>{booking.date.split("-")[2]} {new Date(2026, Number(booking.date.split("-")[1]) - 1).toLocaleString("sv-SE", {month: "long"})}</TableCell>
                      <TableCell>{booking.start_time.split(":")[0]}:{booking.start_time.split(":")[1]}</TableCell>
                      <TableCell>{booking.end_time.split(":")[0]}:{booking.end_time.split(":")[1]}</TableCell>
                      <TableCell>{booking.customer_name}</TableCell>
                      <TableCell>{booking.customer_email}</TableCell>
                      <TableCell>{booking.customer_phone}</TableCell>
                      <TableCell>{booking.notes}</TableCell>
                      
                    </TableRow>
                  )))}
              </TableBody>
            </Table>
            {loading ? (
              <p>Laddar bokningar</p>
            ) : (todayBookings ?? []).length === 0 ? (
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
                      {/*
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className='w-[50%]' disabled={
                            !passedBookings?.some((b) => b.id === booking.id)
                          }>Välj</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => completeBooking(booking.id)}><CalendarCheck /> Slutförd</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => missedBooking(booking.id)}><CalendarX /> Missad tid</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>*/}
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className='text-center pt-8 pb-4 text-muted-foreground text-lg'>
                      Laddar bokningar
                    </TableCell>
                  </TableRow>
                ) : (futureBookings ?? []).length === 0 ? (
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
            {loading ? (
              <p>Laddar bokningar</p>
            ) : (futureBookings ?? []).length === 0 ? (
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
        {(passedBookings ?? []).length !== 0 && (
          <Card className='my-3'>
            <CardHeader>
              <CardTitle><h2>Historik</h2></CardTitle>
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
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {(passedBookings ?? []).map((booking) => (
                      <TableRow className={booking.status == "missed" ? "bg-red-500/10" : "bg-green-700/10"} key={booking.id}>
                        <TableCell>{booking.service.name} - {booking.service.duration_min} min</TableCell>
                        <TableCell>{booking.date.split("-")[2]} {new Date(2026, Number(booking.date.split("-")[1]) - 1).toLocaleString("sv-SE", {month: "long"})}</TableCell>
                        <TableCell>{booking.start_time.split(":")[0]}:{booking.start_time.split(":")[1]}</TableCell>
                        <TableCell>{booking.end_time.split(":")[0]}:{booking.end_time.split(":")[1]}</TableCell>
                        <TableCell>{booking.customer_name}</TableCell>
                        <TableCell>{booking.customer_email}</TableCell>
                        <TableCell>{booking.customer_phone}</TableCell>
                        <TableCell>{booking.notes}</TableCell>
                        <TableCell>
                          <Select value={statusMap[booking.id] || booking.status} onValueChange={(value) => updateStatus(booking.id, value)} >
                            <SelectTrigger className="w-full min-w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              <SelectGroup>
                                <SelectItem value='complete'><CalendarCheck /> Slutfört</SelectItem>
                                <SelectItem value='missed'><CalendarX />  Missad tid</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              
              {(passedBookings ?? []).map((booking) => (
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
                              !passedBookings?.some((b) => b.id === booking.id)
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
      </div>
        
    </div>
  )
}

export default Bookings