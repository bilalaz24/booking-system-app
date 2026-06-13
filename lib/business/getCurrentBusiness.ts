import { headers } from "next/headers"
import { getBusinessByHost } from "./getBusinessByHost"

export async function getCurrentBusiness() {
  const headersList = await headers()
  const host = headersList.get("host") || ""

  console.log("host:", host)

  const business = await getBusinessByHost(host)

  console.log("business:", business)

  return business
}