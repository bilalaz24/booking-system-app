"use client"

import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { createClient } from "@/lib/supabase/client"
import { useStaffUser } from "../providers/StaffUserProvider"
import { AvailableSlots } from "@/lib/types"
import { updateOpeningHours } from "@/lib/actions/staffOpeningHours"
import { toast } from "sonner"
import Loader from "../Loader"
import { Clock, CalendarX, Save } from "lucide-react"

const DAY_NAMES = [
  "Måndag",
  "Tisdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lördag",
  "Söndag",
]

const TIMES = Array.from({ length: 96 }, (_, i) => {
  const hour = Math.floor(i / 4)
  const minute = (i % 4) * 15

  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`
})

type OpeningHoursFormValues = {
  days: {
    dayOfWeek: number
    open: boolean
    startTime: string
    endTime: string
  }[]
}

export default function OpeningHours() {
  const supabase = createClient()
  const user = useStaffUser()

  const [loading, setLoading] = useState(true)

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<OpeningHoursFormValues>({
    defaultValues: { days: [] },
  })

  const fetchOpeningHours = async () => {
    if (!user?.id) return

    setLoading(true)

    const { data, error } = await supabase
      .from("available_slots")
      .select("*")
      .eq("business_id", user.business_id)

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    const slotsByDay = new Map(
      data.map((slot: AvailableSlots) => [slot.day_of_week, slot])
    )

    const formatTime = (time: string) => time.slice(0, 5)

    const formattedDays = DAY_NAMES.map((_, index) => {
      const slot = slotsByDay.get(index)

      return {
        dayOfWeek: index,
        open: !!slot,
        startTime: slot?.start_time ? formatTime(slot.start_time) : "09:00",
        endTime: slot?.end_time ? formatTime(slot.end_time) : "18:00",
      }
    })

    reset({ days: formattedDays })
    setLoading(false)
  }

  useEffect(() => {
    fetchOpeningHours()
  }, [user?.business_id])

  const onSubmit = async (data: OpeningHoursFormValues) => {
    const result = await updateOpeningHours(data)

    if (result?.success) toast.success("Öppettider uppdaterade")
    if (result?.error) toast.error(result.error)
  }

  return (
    <div className="max-w-3xl space-y-6 p-2">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Redigera öppettider
        </h1>
        <p className="text-sm text-muted-foreground">
          Hantera när företaget är öppet för kunder.
        </p>
      </div>

      {loading ? (
        /* CLEAN SKELETON LOADING STATE */
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="p-5 flex items-center justify-between rounded-xl border bg-card/40 animate-pulse">
              <div className="space-y-2 w-1/3">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-3 bg-muted rounded w-16" />
              </div>
              <div className="h-6 bg-muted rounded-full w-10" />
            </div>
          ))}
          <div className="h-10 bg-muted rounded-lg w-36 animate-pulse" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* CARDS LIST WITH CLEAN SPACING */}
          <div className="space-y-3">
            {DAY_NAMES.map((day, index) => (
              <Controller
                key={index}
                name={`days.${index}`}
                control={control}
                render={({ field }) => {
                  const isOpen = field.value.open

                  return (
                    <div
                      className={`rounded-xl border p-5 transition-all duration-200 ${
                        isOpen 
                          ? "bg-card border-muted/60 shadow-sm" 
                          : "bg-muted/5 border-muted/20 opacity-50"
                      }`}
                    >
                      {/* ROW HEADER */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg border transition-colors ${
                              isOpen
                                ? "bg-primary/10 border-primary/20 text-primary"
                                : "bg-muted/40 border-transparent text-muted-foreground"
                            }`}
                          >
                            {isOpen ? (
                              <Clock className="h-4 w-4" />
                            ) : (
                              <CalendarX className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm sm:text-base">{day}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {isOpen
                                ? `${field.value.startTime} — ${field.value.endTime}`
                                : "Stängt"}
                            </p>
                          </div>
                        </div>

                        <Switch
                          checked={isOpen}
                          onCheckedChange={(val) =>
                            field.onChange({
                              ...field.value,
                              open: val,
                            })
                          }
                        />
                      </div>

                      {/* CONTENT PANEL */}
                      {isOpen && (
                        <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-muted/30 animate-in fade-in-50 slide-in-from-top-1 duration-200">
                          <Controller
                            name={`days.${index}.startTime`}
                            control={control}
                            render={({ field: startField }) => (
                              <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground">Öppnar</Label>
                                <Select
                                  value={startField.value}
                                  onValueChange={startField.onChange}
                                >
                                  <SelectTrigger className="h-9 bg-background/50">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TIMES.map((time) => (
                                      <SelectItem key={time} value={time}>
                                        {time}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          />

                          <Controller
                            name={`days.${index}.endTime`}
                            control={control}
                            render={({ field: endField }) => (
                              <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground">Stänger</Label>
                                <Select
                                  value={endField.value}
                                  onValueChange={endField.onChange}
                                >
                                  <SelectTrigger className="h-9 bg-background/50">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TIMES.map((time) => (
                                      <SelectItem key={time} value={time}>
                                        {time}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  )
                }}
              />
            ))}
          </div>

          {/* SAVE BUTTON */}
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-5">
            {isSubmitting ? (
              <div className="flex items-center gap-x-2">
                <Loader />
                <span>Sparar...</span>
              </div>
            ) : (
              <div className="flex items-center gap-x-2">
                <Save className="h-4 w-4" />
                <span>Spara ändringar</span>
              </div>
            )}
          </Button>
        </form>
      )}
    </div>
  )
}