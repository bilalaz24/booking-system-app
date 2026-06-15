"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Props {
  onSelectService: (serviceId: string) => void
}

const Services = ({ onSelectService }: Props) => {
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<any[] | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)

  const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID

  const fetchServices = async () => {
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("business_id", businessId)

      if (error) {
        console.error(error)
        return
      }

      setServices(data)
    } catch (err) {
      console.error("Error fetching services", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const handleSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId)
    onSelectService(serviceId)
  }

  return (
    <div className="flex-1 border border-muted rounded-2xl p-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Välj en tjänst
      </h2>

      {loading ? (
        <p className="text-center text-muted-foreground">
          Laddar tjänster...
        </p>
      ) : (
        <div className="grid gap-4">
          {services?.map((service) => {
            const isSelected = selectedServiceId === service.id

            return (
              <button
                key={service.id}
                onClick={() => handleSelect(service.id)}
                className={`
                  w-full
                  rounded-xl
                  border
                  bg-card
                  p-4
                  text-left
                  transition-all
                  hover:border-ring
                  hover:shadow-md
                  hover:-translate-y-0.5
                  ${
                    isSelected
                      ? "border-accent ring-2 ring-accent shadow-md"
                      : ""
                  }
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {service.name}
                    </h3>

                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.description}
                      </p>
                    )}
                  </div>

                  {service.duration && (
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {service.duration} min
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Services