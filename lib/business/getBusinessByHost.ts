import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

import { Business } from "@/lib/types"
import { BusinessSettings } from "@/lib/types"

export async function getBusinessByHost(host: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const normalizedHost = host
    .split(":")[0]
    .toLowerCase()
    .replace(/^www\./, "")

  const isLocalhost = normalizedHost.includes("localhost")
  const isVercel = normalizedHost.includes("vercel")

  const parts = normalizedHost.split(".")

  const subdomain =
    isLocalhost || isVercel
      ? "trananu"
      : parts.length > 2
        ? parts[0]
        : null

  if (!subdomain) return null

  const { data: business, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", subdomain)
    .maybeSingle<Business>()

  if (error || !business) {
    console.error("Supabase business fetch error:", error)
    return {success: false}
  }

  const { data: settings, error: settingsError } = await supabase
    .from("business_settings")
    .select("*")
    .eq("business_id", business.id)
    .maybeSingle<BusinessSettings>()

  if (settingsError) {
    console.error("Supabase settings fetch error:", settingsError)
    return {success: false}
  }

  return { success: true, business, settings }
}