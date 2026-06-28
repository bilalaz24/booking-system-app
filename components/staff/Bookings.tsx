"use client"

import { useStaffUser } from '../providers/StaffUserProvider'
import React, { use, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Item, ItemActions, ItemContent, ItemTitle } from '../ui/item'
import { Button } from '../ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { CalendarCheck, CalendarDays, CalendarX, CheckCircle2, Clock3, Loader2, Search, XCircle } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { completeBooking, missedBooking } from '@/lib/actions/staffBookings'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import Loader from '../Loader'
import type { Service, Booking } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { BusinessUser } from '@/lib/types'
import { Input } from '../ui/input'

export async function fetchBookings(user: BusinessUser, today: string, search: string, dateFilter?: string, serviceId?: string) {
  const supabase = createClient()

  const fetchToday = supabase
    .from("bookings")
    .select("*, service:service_id(*)")
    .eq("business_id", user.business_id)
    .eq("date", today)
    .in("status", ["confirmed", "pending"])
    .order("start_time", { ascending: true })

  const fetchFuture = supabase
    .from("bookings")
    .select("*, service:service_id(*)")
    .eq("business_id", user.business_id)
    .gt("date", today)
    .in("status", ["confirmed", "pending"])
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })

  /*const fetchPassed = supabase
    .from("bookings")
    .select("*, service:service_id(*)")
    .eq("business_id", user.business_id)
    .or(
      `date.lt.${today},and(date.eq.${today},end_time.lt.${new Date().toTimeString().slice(0,8)})`
    )
    .order("date", { ascending: false })
    .order("start_time", { ascending: false })*/
  
  let fetchPassed = supabase
    .from("bookings")
    .select("*, service:service_id(*)")
    .eq("business_id", user.business_id)
    .order("date", { ascending: false })
    .order("start_time", { ascending: false })

  if (search.trim()) {
    fetchPassed = fetchPassed.or(
      `customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%,customer_email.ilike.%${search}%`
    )
  }

  // DATE FILTER
  if (dateFilter) {
    fetchPassed = fetchPassed.eq("date", dateFilter)
  }

  // SERVICE FILTER
  if (serviceId) {
    fetchPassed = fetchPassed.eq("service_id", serviceId)
  }
  
  const [todayRes, futureRes, passedRes] = await Promise.all([
    fetchToday,
    fetchFuture,
    fetchPassed
  ])
  console.log("FETCHED",passedRes.data)

  return {
    today: todayRes.data ?? [],
    future: futureRes.data ?? [],
    passed: passedRes.data ?? []
  }
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

  const [todayBookings, setTodayBookings] = useState<Booking[] | null>(null)
  const [futureBookings, setFutureBookings] = useState<Booking[] | null>(null)
  const [passedBookings, setPassedBookings] = useState<Booking[] | null>(null)
  const upcomingBookings = [
    ...(todayBookings ?? []).filter(
      (b) => !isBookingPast(b.date, b.end_time)
    ),
    ...(futureBookings ?? [])
  ]

  const [dayView, setDayView] = useState<"simple" | "timeline">("simple")
  const [startHour, setStartHour] = useState<number | null>(null)
  const [endHour, setEndHour] = useState<number | null>(null)

  const [timeUntil, setTimeUntil] = useState("")
  const [dropIn, setDropIn] = useState<30 | 60 | 0>()
  const dropInStyles =
    dropIn === 30
      ? "border-red-500 border-2"
      : dropIn === 60
        ? "border-yellow-500 border-2"
        : "border-green-500 border-2"
  //const [dropInStyles, setDropInStyles] = useState("")

  const [statusMap, setStatusMap] = useState<Record<string, string>>({})
  const debounceRefs = useRef<Record<string, NodeJS.Timeout>>({})

  const [loading, setLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState<Record<string, boolean>>({})

  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState<string | undefined>()
  const [serviceFilter, setServiceFilter] = useState<string | undefined>()

  const [servicesData, setServicesData] = useState<Service[]>([])

  const today = new Date().toISOString().split("T")[0]
  const weekday = (new Date().getDay() + 6) % 7
  //const today = "2026-06-24"

  const fetchHours = async () => {
    const { data, error } = await supabase
      .from("available_slots")
      .select("*")
      .eq("business_id", user.business_id)
      .eq("day_of_week", weekday)
      .order("day_of_week", {ascending: true})
      .maybeSingle()

    if (error) {
      console.error(error)
    }

    if (!data || !data.start_time || !data.end_time) {
      console.error("Couldnt find today's hours")
    }

    setStartHour(Number(data.start_time.split(":")[0]))
    setEndHour(Number(data.end_time.split(":")[0]))
  }

  const fetchServices = async () => {
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("business_id", user.business_id)
      //.eq("is_active", true)
    
    if (!data || !passedBookings) {
      return
    }
    
    const usedServiceIds = new Set(
      (passedBookings ?? []).map((b) => b.service?.id)
    )

    const filtered = data.filter((s) => {
      const hasBookings = usedServiceIds.has(s.id)
      const isActive = s.is_active

      // remove ONLY if inactive AND no bookings
      return isActive || hasBookings
    })

    setServicesData(filtered ?? [])
  }

  const fetchAll = async () => {
    const { today: todaysBookings, future, passed } =
      await fetchBookings(user, today, search, dateFilter, serviceFilter)
    
    console.log("SEARCH",search)

    setTodayBookings(todaysBookings)
    setFutureBookings(future)
    setPassedBookings(passed)
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
      setTimeUntil("Inga tider");
      setDropIn(0)
      return;
    }

    const diff = nextBooking.getTime() - now.getTime();

    const minutesUntil = Math.floor(diff / (1000 * 60));

    if (minutesUntil < 30) {
      setDropIn(30)
    } else if (minutesUntil < 60) {
      setDropIn(60)
    } else {
      setDropIn(0)
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
    /*
    setDropInStyles(dropIn === 30
    ? "border-red-500 bg-red-500/10"
    : dropIn === 60
      ? "border-yellow-500 bg-yellow-500/10"
      : "border-green-500 bg-green-500/10")*/
  };

  useEffect(() => {
    if (!user.business_id) return

    const timeout = setTimeout(() => {
      fetchAll()
    }, 300) // debounce

    return () => clearTimeout(timeout)
  }, [search, dateFilter, serviceFilter])
  
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

    fetchServices()
  }, [passedBookings])

  useEffect(() => {
    if (!user.business_id) return
    
    const init = async () => {
      setLoading(true)
      try {
        await Promise.all([fetchAll(), fetchHours()])
      } catch (error) {
        console.error("Init failed:", error)
      } finally {
        setLoading(false)
      }
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
          <div className="space-y-6">

            {/* TOP BAR */}
            <div className="grid gap-4 lg:grid-cols-3">

              {/* NEXT BOOKING */}
              <Card className="lg:col-span-2">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Nästa bokning
                      </p>

                      {upcomingBookings.length > 0 ? (
                        <>
                          <h2 className="text-3xl font-bold mt-2">
                            {upcomingBookings[0].start_time.slice(0, 5)}
                          </h2>

                          <p className="mt-2 font-medium">
                            {upcomingBookings[0].customer_name}
                          </p>

                          <p className="text-muted-foreground">
                            {upcomingBookings[0].service.name}
                          </p>
                        </>
                      ) : (
                        <p className="mt-3 text-muted-foreground">
                          Inga fler bokningar idag
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Om
                      </p>

                      <p className="text-2xl font-bold">
                        {timeUntil}
                      </p>
                    </div>

                  </div>
                </CardContent>
              </Card>

              {/* DROP IN */}
              <Card className={`transition-all duration-300 ${dropInStyles}`}>
                <CardContent className="p-6">

                  <p className="text-sm text-muted-foreground">
                    Drop-in
                  </p>

                  <p className="text-xl font-semibold mt-2">
                    {dropIn === 30
                      ? "Stängd"
                      : dropIn === 60
                      ? "Begränsad"
                      : "Öppen"}
                  </p>

                  <p className="text-sm text-muted-foreground mt-2">
                    Nästa tid om {timeUntil}
                  </p>

                </CardContent>
              </Card>

            </div>

            {/* DAY OVERVIEW */}
            <Card>
              <CardHeader>

                <div className="flex items-center justify-between gap-4">

                  <div>
                    <CardTitle>Dagens översikt</CardTitle>

                    <CardDescription>
                      Snabb överblick över dagens schema
                    </CardDescription>
                  </div>

                  <div className="flex rounded-lg border p-1 bg-muted/40">

                    <Button
                      variant={dayView === "simple" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setDayView("simple")}
                    >
                      Enkel
                    </Button>

                    <Button
                      variant={dayView === "timeline" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setDayView("timeline")}
                    >
                      Hela dagen
                    </Button>

                  </div>

                </div>

              </CardHeader>

              <CardContent>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader />
                  </div>
                ) : dayView === "simple" ? (

                  <div className="space-y-3">

                    {(todayBookings ?? []).length === 0 ? (
                      <p className="text-muted-foreground">
                        Inga bokningar idag
                      </p>
                    ) : (
                      todayBookings?.map((booking, index) => {
                        const isNext =
                          !isBookingPast(
                            booking.date,
                            booking.end_time
                          ) &&
                          todayBookings.findIndex(
                            b =>
                              !isBookingPast(
                                b.date,
                                b.end_time
                              )
                          ) === index

                        return (
                          <div
                            key={booking.id}
                            className={`
                              flex items-center justify-between
                              rounded-xl border p-4
                              transition-colors
                              ${
                                isNext
                                  ? "border-primary/40 bg-card"
                                  : "bg-card"
                              }
                            `}
                          >

                            <div className="flex items-center gap-4">

                              <div className="text-center min-w-[70px]">
                                <p className="font-bold">
                                  {booking.start_time.slice(0, 5)}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {booking.end_time.slice(0, 5)}
                                </p>
                              </div>

                              <div>

                                <p className="font-medium">
                                  {booking.customer_name}
                                </p>

                                <p className="text-sm text-muted-foreground">
                                  {booking.service.name}
                                </p>

                              </div>

                            </div>

                            {isNext && (
                              <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
                                NÄSTA
                              </span>
                            )}

                          </div>
                        )
                      })
                    )}

                  </div>

                ) : (

                  <div className="space-y-2">

                    {Array.from(
                      { length: endHour! - startHour! + 1 },
                      (_, i) => {
                        const hour = startHour! + i

                        const bookingsInHour =
                          (todayBookings ?? []).filter((booking) => {
                            const bookingStartHour = Number(
                              booking.start_time.split(":")[0]
                            )

                            const bookingEndHour = Number(
                              booking.end_time.split(":")[0]
                            )

                            return (
                              hour >= bookingStartHour &&
                              hour <= bookingEndHour
                            )
                          })

                        const isBooked =
                          bookingsInHour.length > 0

                        return (
                          <div
                            key={hour}
                            className={`
                              flex items-center justify-between
                              rounded-xl border px-4 py-3
                              ${
                                isBooked
                                  ? "border-primary/20 bg-card"
                                  : "bg-card"
                              }
                            `}
                          >

                            <div className="flex items-center gap-3">

                              <div
                                className={`
                                  h-3 w-3 rounded-full
                                  ${
                                    isBooked
                                      ? "bg-primary"
                                      : "bg-muted-foreground/30"
                                  }
                                `}
                              />

                              <p className="font-medium">
                                {String(hour).padStart(2, "0")}:00
                              </p>

                            </div>

                            {isBooked ? (
                              <div className="text-right">

                                <p className="font-medium">
                                  Upptagen
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {bookingsInHour.length} bokning
                                  {bookingsInHour.length > 1 ? "ar" : ""}
                                </p>

                              </div>
                            ) : (
                              <p className="text-sm text-green-600">
                                Ledig
                              </p>
                            )}

                          </div>
                        )
                      }
                    )}

                  </div>

                )}

              </CardContent>
            </Card>

            {/* UPCOMING CUSTOMERS */}
            <Card>
              <CardHeader>
                <CardTitle>Kommer idag</CardTitle>

                <CardDescription>
                  Nästa kunder i schemat
                </CardDescription>
              </CardHeader>

              <CardContent>

                {(todayBookings ?? []).length === 0 ? (
                  <p className="text-muted-foreground">
                    Inga bokningar idag
                  </p>
                ) : (
                  <div className="space-y-3">

                    {todayBookings
                      ?.filter(
                        booking =>
                          !isBookingPast(
                            booking.date,
                            booking.end_time
                          )
                      )
                      .slice(0, 5)
                      .map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between border-b pb-3 last:border-0"
                        >
                          <div>
                            <p className="font-medium">
                              {booking.customer_name}
                            </p>

                            <p className="text-sm text-muted-foreground">
                              {booking.service.name}
                            </p>
                          </div>

                          <p className="font-medium">
                            {booking.start_time.slice(0, 5)}
                          </p>
                        </div>
                      ))}

                  </div>
                )}

              </CardContent>
            </Card>

          </div>
        )}
        {page == "bookings" && (
          <div className="space-y-10">

            <Tabs defaultValue="next">

              {/* HEADER */}
              <div className="flex justify-center">
                <TabsList className="h-auto rounded-xl p-1 bg-muted/60 border">

                  <TabsTrigger
                    value="next"
                    className="
                      rounded-lg px-5 py-2.5
                      text-sm font-medium
                      transition-all
                      data-[state=active]:bg-background
                      data-[state=active]:shadow-sm
                    "
                  >
                    Kommande
                  </TabsTrigger>

                  <TabsTrigger
                    value="history"
                    className="
                      rounded-lg px-5 py-2.5
                      text-sm font-medium
                      transition-all
                      data-[state=active]:bg-background
                      data-[state=active]:shadow-sm
                    "
                  >
                    Historik
                  </TabsTrigger>

                </TabsList>
              </div>

              {/* NEXT BOOKINGS */}
              <TabsContent value="next" className="space-y-6">

                <div>
                  <h2 className="text-xl font-semibold">Kommande bokningar</h2>
                  <p className="text-sm text-muted-foreground">
                    Alla framtida bokningar
                  </p>
                </div>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader />
                  </div>
                ) : upcomingBookings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">
                    Inga kommande bokningar
                  </p>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {upcomingBookings.map((booking, index) => {
                      const isNext = index === 0

                      return (
                        <Card
                          key={booking.id}
                          className={`
                            transition-all
                            hover:shadow-md
                            hover:-translate-y-1
                            ${isNext ? "border-primary/40 ring-1 ring-primary/20" : ""}
                          `}
                        >
                          <CardContent className="p-5 space-y-4">

                            {isNext && (
                              <span className="inline-block text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">
                                NÄSTA
                              </span>
                            )}

                            <div>
                              <h3 className="font-semibold text-lg">
                                {booking.service.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {booking.service.duration_min} min
                              </p>
                            </div>

                            <div className="flex justify-between text-sm">
                              <div>
                                <p className="text-muted-foreground">Datum</p>
                                <p className="font-medium">{booking.date}</p>
                              </div>

                              <div>
                                <p className="text-muted-foreground">Tid</p>
                                <p className="font-medium">
                                  {booking.start_time.slice(0, 5)} -{" "}
                                  {booking.end_time.slice(0, 5)}
                                </p>
                              </div>
                            </div>

                            <div className="border-t pt-3">
                              <p className="text-muted-foreground text-xs">Kund</p>
                              <p className="font-medium">{booking.customer_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {booking.customer_phone}
                              </p>
                            </div>

                            {booking.notes && (
                              <div className="text-sm text-muted-foreground">
                                {booking.notes}
                              </div>
                            )}

                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </TabsContent>

              {/* HISTORY */}
              <TabsContent value="history" className="space-y-6">

                <div>
                  <h2 className="text-xl font-semibold">Historik</h2>
                </div>

                <div className="relative w-full lg:w-[320px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Sök kund, telefon, datum..."
                    className="pl-9"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setDateFilter(undefined)}>All</Button>
                  <Button onClick={() => setDateFilter(today)}>Today</Button>
                  <Button onClick={() => setDateFilter("2026-06-26")}>Custom day</Button>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => setServiceFilter(undefined)}>
                    All services
                  </Button>

                  {servicesData.map((s) => (
                    <Button
                      key={s.id}
                      onClick={() => setServiceFilter(s.id)}
                      variant={serviceFilter === s.id ? "default" : "outline"}
                    >
                      {s.name}
                    </Button>
                  ))}
                </div>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader />
                  </div>
                ) : (passedBookings ?? []).length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">
                    Ingen historik
                  </p>
                ) : (
                  <div className="space-y-3">
                    {passedBookings?.map((booking) => {
                      const status = statusMap[booking.id] || booking.status
                      const isLoading = statusLoading[booking.id]

                      return (
                        <Card
                          key={booking.id}
                          className="transition-colors hover:bg-card"
                        >
                          <CardContent className="p-4">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                              <div className="space-y-1">

                                <div className="flex items-center gap-2">

                                  <div
                                    className={`h-2.5 w-2.5 rounded-full ${
                                      status === "complete" ||
                                      ["confirmed", "pending"].includes(status)
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                    }`}
                                  />

                                  <p className="font-medium">
                                    {booking.service.name}
                                  </p>

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
                                    updateStatus(booking.id, value)
                                  }
                                >
                                  <SelectTrigger>
                                    {isLoading ? (
                                      <div className="flex items-center gap-2">
                                        <Loader />
                                        Sparar...
                                      </div>
                                    ) : (
                                      <SelectValue />
                                    )}
                                  </SelectTrigger>

                                  <SelectContent>
                                    <SelectItem value="complete">
                                      <div className="flex items-center gap-2">
                                        <CalendarCheck className="h-4 w-4 text-green-500" />
                                        Slutförd
                                      </div>
                                    </SelectItem>

                                    <SelectItem value="missed">
                                      <div className="flex items-center gap-2">
                                        <CalendarX className="h-4 w-4 text-red-500" />
                                        Missad tid
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </TabsContent>

            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}

export default Bookings