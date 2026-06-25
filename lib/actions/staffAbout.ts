"use server"

import { cookies } from "next/headers"
import { createClient } from "../supabase/server"
import { aboutSchema, AboutFormValues } from "@/app/schemas/about_page"

export async function updateAboutPage(
  data: AboutFormValues
) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  console.log("-----------------------------------------")
  console.log("received")
  console.log("-----------------------------------------")

  // 1. Validate FIRST
  const parsed = aboutSchema.safeParse(data)

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid form data",
    }
  }

  const {
    hero_description,
    story_content,
    services,
    why_us: why_us_object,
    cta_description,
    cta_title,
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
  console.log("-----------------------------------------")
  console.log(businessId)
  console.log("-----------------------------------------")

  const why_us = why_us_object.map((reason) => reason.text)


  console.log(
    hero_description,
    story_content,
    services,
    why_us,
    cta_description,
    cta_title
  )

  // 4. Update business
  const { error, data: updated } = await supabase
  .from("about_page")
  .update({
      hero_description,
      story_content,
      why_us,
      services,
      cta_title,
      cta_description
    })
    .eq("business_id", businessId)
    .select("*")
    const { error: fetchError, data: fetch } = await supabase
      .from("about_page")
      .select("hero_description, story_content, why_us, services, cta_title, cta_description")
      .eq("business_id", businessId)
    
    console.log(fetch)
    console.log(updated)

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: true,
  }
}