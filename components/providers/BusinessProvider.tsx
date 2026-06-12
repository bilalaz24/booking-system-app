"use client"

import { createContext, useContext } from "react"

type Business = {
  id: string
  name: string
  phone: string
  email: string
  domain: string,
  description: string,
  slug: string,
  address: string,
  created_at: string
}

const BusinessContext = createContext<Business | null>(null)

export function BusinessProvider({ 
  children, 
  value 
}: { 
  children: React.ReactNode; 
  value: Business 
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