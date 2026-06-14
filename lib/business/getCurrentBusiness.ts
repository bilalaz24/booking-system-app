import { headers } from "next/headers"
import { getBusinessByHost } from "./getBusinessByHost"

export async function getCurrentBusiness() {
  const headersList = await headers()
  const host = headersList.get("host") || ""

  console.log("host:", host)

  const result = await getBusinessByHost(host)

  if (!result) {
    throw new Error("No business found")
  }

  console.log("result:", result)

  return result
}