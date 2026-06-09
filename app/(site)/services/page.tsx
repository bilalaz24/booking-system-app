import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getBusiness } from '@/lib/queries/business'
import { createClient } from '@/lib/supabase/server'
import { Service } from '@/lib/types'
import { cookies } from 'next/headers'
import React from 'react'

const ServicesPage = async () => {

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const business = await getBusiness(supabase)
    const businessName = business.business.name
    const { data: services, error } = await supabase.from("services").select("*").eq("business_id", process.env.NEXT_PUBLIC_BUSINESS_ID)

    if (error || !services) {
        console.error("Error fetching services", error)
    }

    return (
        <main className="relative max-w-5xl mx-auto px-6 py-20">
            {/* background glow */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-black/5" />

            {/* HERO */}
            <section className="text-center mb-16">
                <div className="inline-block px-4 py-1 rounded-full bg-barber-red/10 text-barber-red text-sm mb-4">
                    {businessName}
                </div>

                <h1 className="text-5xl font-bold mb-4 tracking-tight">
                    Våra tjänster
                </h1>

                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {business.business.description}
                </p>
            </section>

            {/* SERVICES GRID */}
            <section className="grid gap-6 md:grid-cols-2">
                {services?.map((service: Service) => (
                <Card
                    key={service.id}
                    className="group transition-all hover:-translate-y-1 hover:shadow-md border bg-card"
                >
                    <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span className="group-hover:text-barber-blue transition">
                        {service.name}
                        </span>

                        <span className="text-barber-blue font-semibold">
                        {service.price} kr
                        </span>
                    </CardTitle>

                    <CardDescription>
                        {service.duration_min} min
                    </CardDescription>
                    </CardHeader>

                    <CardContent>
                    <p className="text-muted-foreground text-sm leading-6">
                        {service.description}
                    </p>
                    </CardContent>
                </Card>
                ))}
            </section>
        </main>
    )
}

export default ServicesPage