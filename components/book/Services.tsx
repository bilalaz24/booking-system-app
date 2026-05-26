"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "../ui/button"

interface Props {
  onSelectService: (service: string) => void
}

const Services = ({onSelectService} : Props) => {
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<any[] | null>(null)

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

  return (
    <div className={`flex-1 flex text-center justify-center border border-b-muted rounded-2xl py-8`}>
      <div>
        <h2 className="text-xl mb-4">Välj en tjänst</h2>
        <div>
          {loading ? (
            <p>Laddar tjänster</p>
          ) : (
            <div>
              {services?.map((service) => (
                <div key={service.id}>
                  <Button className='bg-card text-card-foreground' onClick={() => onSelectService(service.id)}>
                    {service.name}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Services