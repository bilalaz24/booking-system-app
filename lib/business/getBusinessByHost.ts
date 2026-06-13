import { createClient } from "../supabase/server"
import { cookies } from "next/headers"

export async function getBusinessByHost(host: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const cleanHost = host.split(":")[0].toLowerCase()

  // optional: strip www
  const normalizedHost = cleanHost.replace(/^www\./, "")

  const isLocalhost = normalizedHost.includes("localhost")
  const isVercel = normalizedHost.includes("vercel")

  const parts = normalizedHost.split(".")

  const subdomain = isLocalhost
  ? "fadestudio" // or your test business slug
  : isVercel
  ? "fadestudio"
  : parts.length > 2
    ? parts[0]
    : null

  // detect subdomain (fadestudio.nexora.com → fadestudio)
  //const subdomain = parts.length > 2 ? parts[0] : null

  console.log("From getBusinessByHost, subdomain:", subdomain)

  const {data: business, error} = await supabase
  .from("businesses")
  .select("*")
  .eq("slug", subdomain)
  .maybeSingle()

  if (error) {
    console.error("Supabase error:", error)
    return null
    }
  
  /*const business = await db.business.findFirst({
    where: {
      OR: [
        subdomain ? { slug: subdomain } : undefined,

        { customDomains: { has: normalizedHost } },
      ].filter(Boolean),
    },
  })*/

  return business
}