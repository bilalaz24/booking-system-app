"use client"

import React, { useMemo } from "react"
import { Card, CardContent } from "../ui/card"
import type { Booking } from "@/lib/types"
import {
  Calendar,
  CalendarX,
  Clock3,
  CheckCircle2,
  Banknote,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

const Stats = ({
  todayBookings,
  futureBookings,
  passedBookings,
}: {
  todayBookings: Booking[]
  futureBookings: Booking[]
  passedBookings: Booking[]
}) => {
  const stats = useMemo(() => {
    const all = [
      ...(todayBookings ?? []),
      ...(futureBookings ?? []),
      ...(passedBookings ?? []),
    ]

    const completed = passedBookings?.filter(b => b.status === "complete") ?? []
    const missed = passedBookings?.filter(b => b.status === "missed") ?? []

    const upcoming = futureBookings?.length ?? 0

    const revenue = (list: Booking[]) =>
      list
        .filter(b => b.status === "complete")
        .reduce((sum, b) => sum + (b.service?.price ?? 0), 0)

    const thisMonth = all.filter(b => {
      const d = new Date(b.date)
      const now = new Date()
      return d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
    })

    const lastMonth = all.filter(b => {
      const d = new Date(b.date)
      const now = new Date()
      const last = new Date(now)
      last.setMonth(now.getMonth() - 1)

      return d.getMonth() === last.getMonth() &&
        d.getFullYear() === last.getFullYear()
    })

    const thisRevenue = revenue(thisMonth)
    const lastRevenue = revenue(lastMonth)

    const change =
      lastRevenue === 0
        ? 100
        : ((thisRevenue - lastRevenue) / lastRevenue) * 100

    return {
      all,
      total: all.length,
      completed: completed.length,
      missed: missed.length,
      upcoming,
      thisRevenue,
      change,
    }
  }, [todayBookings, futureBookings, passedBookings])

  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      bookings: 0,
    }))

    ;(stats.all ?? []).forEach((b) => {
      if (!b.start_time) return
      const hour = Number(b.start_time.split(":")[0])
      if (!isNaN(hour) && hours[hour]) {
        hours[hour].bookings += 1
      }
    })

    return hours
  }, [stats.all])

  const StatCard = ({
    label,
    value,
    icon,
    tone = "neutral",
  }: {
    label: string
    value: string | number
    icon: React.ReactNode
    tone?: "neutral" | "good" | "bad"
  }) => {
    const iconColor =
      tone === "good"
        ? "text-emerald-500"
        : tone === "bad"
        ? "text-red-500"
        : "text-blue-500"

    const valueColor =
      tone === "good"
        ? "text-emerald-500"
        : tone === "bad"
        ? "text-red-500"
        : "text-foreground"

    return (
      <Card className="border-muted/50 bg-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className={`text-3xl font-semibold mt-2 ${valueColor}`}>
                {value}
              </p>
            </div>
            <div className={iconColor}>{icon}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Statistik</h1>
        <p className="text-sm text-muted-foreground">
          Översikt av bokningar och intäkter
        </p>
      </div>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        <StatCard label="Totalt" value={stats.total} icon={<Calendar />} />

        <StatCard label="Kommande" value={stats.upcoming} icon={<Clock3 />} />

        <StatCard label="Klart" value={stats.completed} icon={<CheckCircle2 />} tone="good" />

        <StatCard label="Missade" value={stats.missed} icon={<CalendarX />} tone="bad" />

      </div>

      {/* REVENUE */}
      <div className="grid gap-4 md:grid-cols-2">

        <StatCard
          label="Intäkt denna månad"
          value={`${stats.thisRevenue} kr`}
          icon={<Banknote />}
          tone="good"
        />

        <StatCard
          label="Tillväxt"
          value={`${stats.change.toFixed(1)}%`}
          icon={
            stats.change >= 0 ? <TrendingUp /> : <TrendingDown />
          }
          tone={stats.change >= 0 ? "good" : "bad"}
        />
      </div>

      <Card className="border-muted/50">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Bokningar per timme
          </p>
          <p className="text-lg font-semibold mb-4">
            När kunder bokar mest
          </p>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <XAxis dataKey="hour" />
                <YAxis />
                <Bar
                  dataKey="bookings"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

export default Stats