import React from "react"
import { Card } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { CalendarCheck, CalendarX } from "lucide-react"

export const BookingCard = React.memo(function BookingCard({
  booking,
  expanded,
  setExpanded,
  status,
  isLoading,
  updateStatus,
}: any) {
  return (
    <Card
        key={booking.id}
        className="transition-colors hover:bg-muted/40"
    >

        {/* HEADER */}
        <div
        className="p-4 cursor-pointer"
        onClick={() =>
            setExpanded(
            expanded === booking.id ? null : booking.id
            )
        }
        >

        <div className="flex items-center justify-between">

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

            {/* STATUS CONTROL */}
            <div onClick={(e) => e.stopPropagation()}>
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
                <SelectTrigger className="w-[160px]">
                {isLoading ? "Sparar..." : <SelectValue />}
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
        </div>

        {/* ANIMATED CONTENT */}
        <div
        className={`
            overflow-hidden
            transition-all duration-200 ease-out
            ${expanded === booking.id
            ? "max-h-96 opacity-100 mt-3"
            : "max-h-0 opacity-0"
            }
        `}
        >
        <div className="overflow-hidden">
            <div className="px-4 pb-4 pt-3 border-t">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                {/* PHONE */}
                <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Telefon
                </p>
                <p className="text-sm font-medium mt-1">
                    {booking.customer_phone}
                </p>
                </div>

                {/* EMAIL */}
                <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    E-post
                </p>
                <p className="text-sm font-medium mt-1 truncate">
                    {booking.customer_email || "—"}
                </p>
                </div>

                {/* TIME */}
                <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Tid
                </p>
                <p className="text-sm font-medium mt-1">
                    {booking.start_time.slice(0, 5)} – {booking.end_time.slice(0, 5)}
                </p>
                </div>

            </div>

            {/* NOTES */}
            {booking.notes && (
                <div className="mt-3 rounded-lg border bg-background p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Anteckningar
                </p>
                <p className="text-sm mt-1 leading-relaxed">
                    {booking.notes}
                </p>
                </div>
            )}

            </div>
        </div>
        </div>

    </Card>
  )
})