"use server"

import { cookies } from "next/headers"
import { createClient } from "../supabase/server"

type OpeningHoursFormValues = {
  days: {
    dayOfWeek: number
    open: boolean
    startTime: string
    endTime: string
  }[]
}

export async function updateOpeningHours(
  data: OpeningHoursFormValues
) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. Auth check
  const { data: userData, error: userError } =
    await supabase.auth.getUser()

  if (userError || !userData.user) {
    return {
      success: false,
      error: "Unauthorized",
    }
  }

  // 2. Get business_id from user
  const { data: businessUser, error: businessError } =
    await supabase
      .from("business_users")
      .select("business_id")
      .eq("auth_user_id", userData.user.id)
      .single()

  if (businessError || !businessUser) {
    return {
      success: false,
      error: "Business not found",
    }
  }

  const businessId = businessUser.business_id

  // 3. Delete existing hours (RESET)
  const { error: deleteError } = await supabase
    .from("available_slots")
    .delete()
    .eq("business_id", businessId)

  if (deleteError) {
    return {
      success: false,
      error: deleteError.message,
    }
  }

  // 4. Insert only OPEN days
  const rowsToInsert = data.days
    .filter((day) => day.open)
    .map((day) => ({
      business_id: businessId,
      day_of_week: day.dayOfWeek,
      start_time: day.startTime,
      end_time: day.endTime,
    }))

  // If everything is closed
  if (rowsToInsert.length === 0) {
    return {
      success: true,
    }
  }

  const { error: insertError } = await supabase
    .from("available_slots")
    .insert(rowsToInsert)

  if (insertError) {
    return {
      success: false,
      error: insertError.message,
    }
  }

  return {
    success: true,
  }
}