"use client"

import { useStaffUser } from '../providers/StaffUserProvider'
import React, { use, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Item, ItemActions, ItemContent, ItemTitle } from '../ui/item'
import { Button } from '../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { CalendarCheck, CalendarDays, CalendarX, CheckCircle2, Clock3, Loader2, XCircle } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { completeBooking, missedBooking } from '@/lib/actions/staffBookings'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import Loader from '../Loader'
import type { Service, Booking } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

/*
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
}*/

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
  const [dropInStyles, setDropInStyles] = useState("")

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
    setDropInStyles(dropIn === 30
    ? "border-red-500 bg-red-500/10"
    : dropIn === 60
      ? "border-yellow-500 bg-yellow-500/10"
      : "border-green-500 bg-green-500/10")
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
            {/*
            <Card className={`${dropIn == 30 ? "bg-red-500/10" : dropIn == 60 ? "bg-yellow-400/10" : "bg-green-700/10"} my-3`}>
              <CardHeader>
                <CardTitle><h2>Drop in</h2></CardTitle>
              </CardHeader>
              <CardContent>
                <p>Nästa bokning om: {timeUntil}</p>
              </CardContent>
            </Card>*/}

            {/* DROP-IN */}
            <Card className={`border-2 ${dropInStyles}`}>
              <CardContent className="py-8">
                <p className="uppercase tracking-wider text-muted-foreground">
                  Drop-in Status
                </p>

                <h3 className="text-3xl font-bold mt-2">
                  {dropIn === 30
                    ? "Inte tillgänglig"
                    : dropIn === 60
                    ? "Begränsad tid"
                    : "Tillgänglig"}
                </h3>

                <p className="text-muted-foreground mt-3">
                  Nästa tid om {timeUntil}
                </p>
              </CardContent>
            </Card>

            {/* OVERVIEW CARDS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 my-4">
              <Card>
                <CardContent className="flex items-center justify-between py-6">
                  <div>
                    <p className="text-lg text-muted-foreground">
                      Dagens bokningar
                    </p>
                    <h4 className="text-3xl font-bold mt-2">
                      {todayBookings?.length ?? 0}
                    </h4>
                  </div>
                  <CalendarDays />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center justify-between py-6">
                  <div>
                    <p className="text-lg text-muted-foreground">
                      Kommande
                    </p>
                    <h4 className="text-3xl font-bold mt-2">
                      {upcomingBookings.length}
                    </h4>
                  </div>
                  <Clock3 />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center justify-between py-6">
                  <div>
                    <p className="text-lg text-muted-foreground">
                      Slutförda
                    </p>
                    <h4 className="text-3xl font-bold mt-2">
                      {
                        (passedBookings ?? []).filter(
                          b => (statusMap[b.id] || b.status) === "complete"
                        ).length
                      }
                    </h4>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center justify-between py-6">
                  <div>
                    <p className="text-lg text-muted-foreground">
                      Missade
                    </p>
                    <h4 className="text-3xl font-bold mt-2">
                      {
                        (passedBookings ?? []).filter(
                          b => (statusMap[b.id] || b.status) === "missed"
                        ).length
                      }
                    </h4>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </CardContent>
              </Card>
            </div>

            {/* TODAYS BOOKINGS */}
            <Card className='my-3'>
              <CardHeader>
                <CardTitle><h2 className='text-xl'>Dagens schema</h2></CardTitle>
                <CardDescription>Alla återstående bokingar för idag</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader />
                  </div>
                ) : (todayBookings ?? []).length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Inga bokningar idag
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {(todayBookings ?? []).map((booking, index) => {
                      const isNext =
                        index === 0 &&
                        !isBookingPast(booking.date, booking.end_time)

                      return (
                        <Card
                          key={booking.id}
                          className={`
                            transition-all
                            hover:shadow-lg
                            hover:-translate-y-1
                            ${
                              isNext
                                ? "border-primary ring-2 ring-primary/20"
                                : ""
                            }
                          `}
                        >
                          <CardContent className="p-5">
                            {isNext && (
                              <div className="mb-4">
                                <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
                                  NÄSTA BOKNING
                                </span>
                              </div>
                            )}

                            <div className="space-y-4">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {booking.service.name}
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                  {booking.service.duration_min} minuter
                                </p>
                              </div>

                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Start
                                  </p>

                                  <p className="font-medium">
                                    {booking.start_time.slice(0, 5)}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Slut
                                  </p>

                                  <p className="font-medium">
                                    {booking.end_time.slice(0, 5)}
                                  </p>
                                </div>
                              </div>

                              <div className="border-t pt-4">
                                <p className="text-xs text-muted-foreground">
                                  Kund
                                </p>

                                <p className="font-medium">
                                  {booking.customer_name}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Telefon
                                </p>

                                <p>
                                  {booking.customer_phone}
                                </p>
                              </div>

                              {booking.customer_email && (
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    E-post
                                  </p>

                                  <p className="break-all">
                                    {booking.customer_email}
                                  </p>
                                </div>
                              )}

                              {booking.notes && (
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Anteckningar
                                  </p>

                                  <p className="text-sm">
                                    {booking.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}

                {/*
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
                )}*/}
              </CardContent>
            </Card>
          </div>
        )}
        {page == "bookings" && (
          <div>
            <Tabs defaultValue='next'>
              <div className='flex justify-center'>
                <TabsList>
                  <TabsTrigger value='next'>Kommande</TabsTrigger>
                  <TabsTrigger value='history'>Historik</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value='next'>
                <Card className='my-3'>
                  <CardHeader>
                    <CardTitle><h2>Kommande bokingar</h2></CardTitle>
                    <CardDescription>Alla framtida bokningar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center py-12">
                        <Loader />
                      </div>
                    ) : upcomingBookings.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">
                          Inga kommande bokningar
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-4 lg:grid-cols-2">
                        {upcomingBookings.map((booking, index) => {
                          const isNext = index === 0

                          return (
                            <Card
                              key={booking.id}
                              className={`
                                transition-all
                                hover:shadow-lg
                                hover:-translate-y-1
                                ${
                                  isNext
                                    ? "border-primary ring-2 ring-primary/20"
                                    : ""
                                }
                              `}
                            >
                              <CardContent className="p-5">
                                {isNext && (
                                  <span className="inline-block rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium mb-4">
                                    NÄSTA BOKNING
                                  </span>
                                )}

                                <div className="space-y-4">
                                  <div>
                                    <h3 className="font-semibold text-lg">
                                      {booking.service.name}
                                    </h3>

                                    <p className="text-sm text-muted-foreground">
                                      {booking.service.duration_min} min
                                    </p>
                                  </div>

                                  <div className="flex justify-between">
                                    <div>
                                      <p className="text-xs text-muted-foreground">
                                        Datum
                                      </p>

                                      <p className="font-medium">
                                        {booking.date}
                                      </p>
                                    </div>

                                    <div>
                                      <p className="text-xs text-muted-foreground">
                                        Tid
                                      </p>

                                      <p className="font-medium">
                                        {booking.start_time.slice(0, 5)}
                                        {" - "}
                                        {booking.end_time.slice(0, 5)}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="border-t pt-4">
                                    <p className="text-xs text-muted-foreground">
                                      Kund
                                    </p>

                                    <p className="font-medium">
                                      {booking.customer_name}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Telefon
                                    </p>

                                    <p>
                                      {booking.customer_phone}
                                    </p>
                                  </div>

                                  {booking.customer_email && (
                                    <div>
                                      <p className="text-xs text-muted-foreground">
                                        E-post
                                      </p>

                                      <p className="break-all">
                                        {booking.customer_email}
                                      </p>
                                    </div>
                                  )}

                                  {booking.notes && (
                                    <div>
                                      <p className="text-xs text-muted-foreground">
                                        Anteckningar
                                      </p>

                                      <p className="text-sm">
                                        {booking.notes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card> 
              </TabsContent>
              <TabsContent value='history'>
                <Card className='my-3'>
                  <CardHeader>
                    <CardTitle><h2>Historik</h2></CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {loading ? (
                      <div className="flex justify-center py-12">
                        <Loader />
                      </div>
                    ) : (passedBookings ?? []).length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">
                          Ingen historik
                        </p>
                      </div>
                    ) : (
                      passedBookings?.map((booking) => {
                        const status =
                          statusMap[booking.id] || booking.status

                        const isLoading =
                          statusLoading[booking.id]

                        return (
                          <Card
                            key={booking.id}
                            className="transition-all hover:shadow-md"
                          >
                            <CardContent className="p-4">
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`h-2 w-2 rounded-full ${
                                        status === "complete" || ["confirmed", "pending"].includes(status)
                                          ? "bg-green-500"
                                          : "bg-red-500"
                                      }`}
                                    />

                                    <h3 className="font-medium">
                                      {booking.service.name}
                                    </h3>
                                  </div>

                                  <p className="text-sm text-muted-foreground">
                                    {booking.customer_name}
                                  </p>

                                  <p className="text-sm text-muted-foreground">
                                    {booking.date} • {booking.start_time.slice(0, 5)}
                                  </p>
                                </div>

                                <div className="min-w-[180px]">
                                  <Select
                                    value={
                                      ["confirmed", "pending"].includes(status)
                                      ? "complete"
                                      : status
                                    }
                                    onValueChange={(value) =>
                                      updateStatus(
                                        booking.id,
                                        value
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      {isLoading ? (
                                        <>
                                          <Loader />
                                          Sparar...
                                        </>
                                      ) : (
                                        <SelectValue />
                                      )}
                                    </SelectTrigger>

                                    <SelectContent>
                                      <SelectItem value="complete">
                                        <CalendarCheck />
                                        Slutfört
                                      </SelectItem>

                                      <SelectItem value="missed">
                                        <CalendarX />
                                        Missad tid
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}

export default Bookings