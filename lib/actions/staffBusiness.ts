"use server"

import { cookies } from "next/headers"
import { createClient } from "../supabase/server"
import {
  businessProfileSchema,
  ProfileFormValues,
} from "@/app/schemas/business"

export async function updateBusiness(
  data: ProfileFormValues
) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. Validate FIRST
  const parsed = businessProfileSchema.safeParse(data)

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid form data",
    }
  }

  const {
    name,
    hero_title,
    hero_description,
    address,
    city,
    phone,
    email,
    instagram,
    facebook,
  } = parsed.data

  // 2. Get authenticated user
  const { data: userData, error: userError } =
    await supabase.auth.getUser()

  if (userError || !userData.user) {
    return {
      success: false,
      error: "Unauthorized",
    }
  }

  // 3. Get business id from DB (IMPORTANT)
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

  // 4. Update business
  const { error: businessUpdateError } = await supabase
    .from("businesses")
    .update({
      name,
      address,
      city,
      phone,
      email,
    })
    .eq("id", businessId)

  if (businessUpdateError) {
    return {
      success: false,
      error: businessUpdateError.message,
    }
  }

  // 5. Update settings
  const { error: settingsError } = await supabase
    .from("business_settings")
    .update({
      hero_title,
      hero_description,
      instagram_url: instagram,
      facebook_url: facebook,
    })
    .eq("business_id", businessId)

  if (settingsError) {
    return {
      success: false,
      error: settingsError.message,
    }
  }

  return {
    success: true,
  }
}