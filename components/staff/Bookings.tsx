"use client"

import { useStaffUser } from '../providers/StaffUserProvider'
import React, { use, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Item, ItemActions, ItemContent, ItemTitle } from '../ui/item'
import { Button } from '../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { CalendarCheck, CalendarX, Loader2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { completeBooking, missedBooking } from '@/lib/actions/staffBookings'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import Loader from '../Loader'

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

const Bookings = ({ page }: { page: string }) => {
  const supabase = createClient()
  const user = useStaffUser()

  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [todayBookings, setTodayBookings] = useState<Booking[] | null>(null)
  const [futureBookings, setFutureBookings] = useState<Booking[] | null>(null)
  const [passedBookings, setPassedBookings] = useState<Booking[] | null>(null)
  const upcomingBookings = [
    ...(todayBookings ?? []).filter(
      (b) => !isBookingPast(b.date, b.end_time)
    ),
    ...(futureBookings ?? [])
  ]

  const [timeUntil, setTimeUntil] = useState("")
  const [dropIn, setDropIn] = useState<number>()

  const [statusMap, setStatusMap] = useState<Record<string, string>>({})
  const debounceRefs = useRef<Record<string, NodeJS.Timeout>>({})

  const [loading, setLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState<Record<string, boolean>>({})

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
      .order("date", { ascending: false })
      .order("start_time", { ascending: false })
    
    if (error) {
      console.error(error)
    }

    console.log(data)
    setPassedBookings(data ?? [])
  }

  /*
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
  }*/

  const updateStatus = (id: string, value: string) => {
    // optimistic update
    setStatusMap((prev) => ({
      ...prev,
      [id]: value,
    }))

    // set loading for THIS booking
    setStatusLoading((prev) => ({
      ...prev,
      [id]: true,
    }))

    if (debounceRefs.current[id]) {
      clearTimeout(debounceRefs.current[id])
    }

    debounceRefs.current[id] = setTimeout(async () => {
      try {
        if (value == "complete") completeBooking(id)
        else if (value == "missed") missedBooking(id)
      } finally {
        setStatusLoading((prev) => ({
          ...prev,
          [id]: false,
        }))
      }
    }, 1000)
  }

  const updateTime = () => {
    const now = new Date();

    const nextBooking = upcomingBookings
      .map((booking) => new Date(booking.date+"T"+booking.start_time))
      .filter((date) => date > now)
      .sort((a, b) => a.getTime() - b.getTime())[0];

    //console.log(nextBooking)

    if (!nextBooking) {
      setTimeUntil("No upcoming bookings");
      return;
    }

    const diff = nextBooking.getTime() - now.getTime();

    const minutesUntil = Math.floor(diff / (1000 * 60));

    if (minutesUntil < 60) {
      setDropIn(60)
    }

    if (minutesUntil < 30) {
      setDropIn(30)
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(
      (diff % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor(
      (diff % (1000 * 60)) / 1000
    );

    setTimeUntil(
      `${hours}h ${minutes}m`
    );
  };
  
  useEffect(() => {

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [upcomingBookings]);


  useEffect(() => {
    return () => {
      Object.values(debounceRefs.current).forEach(clearTimeout)
    }
  }, [])

  useEffect(() => {
    if (!passedBookings) return

    const initial = Object.fromEntries(
      passedBookings?.map((b) => [b.id, b.status])
    )

    console.log(initial)
    
    setStatusMap(initial)
  }, [passedBookings])

  useEffect(() => {
    if (!user.business_id) return
    
    const init = async () => {
      setLoading(true)
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
        {page == "overview" && (
          <div>
            <Card className={`${dropIn == 30 ? "bg-red-500/10" : dropIn == 60 ? "bg-yellow-400/10" : "bg-green-700/10"} my-3`}>
              <CardHeader>
                <CardTitle><h2>Drop in</h2></CardTitle>
              </CardHeader>
              <CardContent>
                <p>Nästa bokning om: {timeUntil}</p>
              </CardContent>
            </Card>
            <Card className='my-3'>
              <CardHeader>
                <CardTitle><h2>Dagens nästa tider</h2></CardTitle>
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
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
        {page == "bookings" && (
          <div>
            <Card className='my-3'>
              <CardHeader>
                <CardTitle><h2>Kommande</h2></CardTitle>
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
                    ) : (upcomingBookings ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className='text-center pt-8 pb-4 text-muted-foreground text-lg'>
                          Inga bokningar
                        </TableCell>
                      </TableRow>
                    ) : (
                      (upcomingBookings ?? []).map((booking) => {
                        return (
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
                        )})
                    )}
                  </TableBody>
                </Table>
                
                {(upcomingBookings ?? []).map((booking) => (
                    <Card key={booking.id} className="lg:hidden">
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
                        </div>
                      </CardContent>
                    </Card>
                ))}
              </CardContent>
            </Card>        
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
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={9} className='text-center pt-8 pb-4 text-muted-foreground text-lg'>
                          Laddar bokningar
                        </TableCell>
                      </TableRow>
                    ) : (passedBookings ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className='text-center pt-8 pb-4 text-muted-foreground text-lg'>
                          Inga bokningar
                        </TableCell>
                      </TableRow>
                    ) : (
                      (passedBookings ?? []).map((booking) => {
                        const isLoading = statusLoading[booking.id]
                        return (
                          <TableRow className={(statusMap[booking.id] || booking.status) == "missed" ? "bg-red-500/10" : "bg-green-700/10"} key={booking.id}>
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
                                <SelectTrigger className="w-full min-w-36 flex text-left justify-between">
                                  {isLoading ? (<><Loader /> Sparar...</>) : <SelectValue className='text-left' />}
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
                        )})
                    )}
                  </TableBody>
                </Table>
                {(passedBookings ?? []).map((booking) => {
                  const isLoading = statusLoading[booking.id]
                  return (
                    <Card key={booking.id} className={`
                      ${
                        (statusMap[booking.id] || booking.status) === "missed"
                          ? "bg-red-500/10"
                          : "bg-green-700/10"
                      }
                      lg:hidden
                    `}>
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
                          <Select value={statusMap[booking.id] || booking.status} onValueChange={(value) => updateStatus(booking.id, value)} >
                            <SelectTrigger className="w-full min-w-36 flex text-left justify-between">
                              {isLoading ? (<><Loader /> Sparar...</>) : <SelectValue className='text-left' />}
                            </SelectTrigger>
                            <SelectContent position="popper">
                              <SelectGroup>
                                <SelectItem value='complete'><CalendarCheck /> Slutfört</SelectItem>
                                <SelectItem value='missed'><CalendarX />  Missad tid</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                )})}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
        
    </div>
  )
}

export default Bookings