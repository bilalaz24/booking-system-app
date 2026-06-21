"use client"

import { useEffect, useState } from "react"
import { Controller, useForm, useFieldArray } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { createClient } from "@/lib/supabase/client"
import { useBusiness } from "../providers/BusinessProvider"
import { AvailableSlots } from "@/lib/types"
import { updateOpeningHours } from "@/lib/actions/staffOpeningHours"
import { toast } from "sonner"
import Loader from "../Loader"
import { useStaffUser } from "../providers/StaffUserProvider"

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

  const { control, handleSubmit, reset, formState: { isSubmitting }, } =
    useForm<OpeningHoursFormValues>({
      defaultValues: {
        days: [],
      },
    })

  const { fields } = useFieldArray({
    control,
    name: "days",
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
      data.map((slot: AvailableSlots) => [
        slot.day_of_week,
        slot,
      ])
    )

    const formatTime = (time: string) =>
      time.slice(0, 5)

    const formattedDays = DAY_NAMES.map((_, index) => {
      const slot = slotsByDay.get(index)

      return {
        dayOfWeek: index,
        open: !!slot,
        startTime: slot?.start_time
          ? formatTime(slot.start_time)
          : "09:00",
        endTime: slot?.end_time
          ? formatTime(slot.end_time)
          : "18:00",
      }
    })

    reset({ days: formattedDays })
    setLoading(false)
  }

  useEffect(() => {
    fetchOpeningHours()
  }, [user?.business_id])

  const onSubmit = async (data: OpeningHoursFormValues) => {
    console.log("submit:", data)
    const result = await updateOpeningHours(data)

    if (result?.success) {
        toast.success("Öppettider updaterades")
    }

    if (result?.error) {
        toast.error(result.error)
    }
  }

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Laddar öppettider...
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">

      <div>
        <h1 className="text-2xl font-semibold">
          Redigera öppettider
        </h1>
        <p className="text-sm text-muted-foreground">
          Hantera när företaget är öppet för kunder.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>
              Öppettider
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-xl border bg-card p-4"
              >

                {/* OPEN STATE CONTROL */}
                <Controller
                  name={`days.${index}.open`}
                  control={control}
                  render={({ field: openField }) => {
                    const isOpen = openField.value

                    return (
                      <>
                        {/* Header */}
                        <div className="flex items-center justify-between">

                          <div>
                            <h3 className="font-medium">
                              {DAY_NAMES[field.dayOfWeek]}
                            </h3>

                            <p className="text-sm text-muted-foreground">
                              {isOpen
                                ? `${field.startTime} - ${field.endTime}`
                                : "Stängt"}
                            </p>
                          </div>

                          <Switch
                            checked={isOpen}
                            onCheckedChange={openField.onChange}
                          />
                        </div>

                        {/* OPEN TIMES */}
                        {isOpen ? (
                          <div className="mt-4 grid grid-cols-2 gap-4">

                            <Controller
                              name={`days.${index}.startTime`}
                              control={control}
                              render={({ field }) => (
                                <div className="space-y-2">
                                  <Label>Öppnar</Label>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {TIMES.map((time) => (
                                        <SelectItem
                                          key={time}
                                          value={time}
                                        >
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
                              render={({ field }) => (
                                <div className="space-y-2">
                                  <Label>Stänger</Label>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {TIMES.map((time) => (
                                        <SelectItem
                                          key={time}
                                          value={time}
                                        >
                                          {time}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            />

                          </div>
                        ) : (
                          <div className="mt-4 rounded-lg bg-muted p-3">
                            <p className="text-sm text-muted-foreground">
                              Företaget är stängt denna dag.
                            </p>
                          </div>
                        )}
                      </>
                    )
                  }}
                />
              </div>
            ))}

          </CardContent>
        </Card>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <div className="flex items-center gap-x-2">
            <Loader />
            <span>Sparar...</span>
          </div>
        ) : (
          "Spara ändringar"
        )}
      </Button>
      </form>
    </div>
  )
}