"use client"

import { createContext, useContext } from "react"
import { Business } from "@/lib/types";
import { BusinessSettings } from "@/lib/types";

const BusinessContext = createContext<{business: Business, settings: BusinessSettings} | null>(null)

export function BusinessProvider({ 
  children, 
  value 
}: { 
  children: React.ReactNode; 
  value: {business: Business, settings: BusinessSettings }
}) {
  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const context = useContext(BusinessContext)
  if (!context) {
    throw new Error("useBusiness must be used within a BusinessProvider")
  }
  return context
}