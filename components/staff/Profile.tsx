"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import { createClient } from "@/lib/supabase/client"
import { useBusiness } from "../providers/BusinessProvider"

const Profile = () => {
    const supabase = createClient()
    const business = useBusiness()
    //const [businessSettings, setBusinessSettings] = useState<object>()
    console.log(business)

    /*
    useEffect(() => {
        const fetchData = async () => {
            const {data, error} = await supabase.from("business_settings").select("*").eq("business_id", business.id).single()
            if (error) {
                console.error("Error fetching business settings", error)
            }
            setBusinessSettings(data)
        }
        fetchData()
    })*/

    return (
        <div className="max-w-3xl space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-2xl font-semibold">
                Redigera företagsprofil
            </h1>
            <p className="text-sm text-muted-foreground">
                Information som visas för kunder
            </p>
            </div>

            {/*<Button>
            Spara
            </Button>*/}
        </div>

        {/* Basic Info */}
        <Card>
            <CardHeader>
            <CardTitle>Grundinformation</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

            <div className="space-y-1">
                <label className="text-sm font-medium">
                Företagsnamn
                </label>
                <Input placeholder="Företagsnamn" value={business.name} />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">
                Beskrivning
                </label>
                <Textarea
                placeholder="Berätta kort om din verksamhet..."
                value={business.description}
                className="min-h-[100px]"
                />
            </div>

            </CardContent>
        </Card>

        {/* Contact */}
        <Card>
            <CardHeader>
            <CardTitle>Kontakt</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

            <div className="space-y-1">
                <label className="text-sm font-medium">
                E-post
                </label>
                <Input value={business.email} type="email" placeholder="info@företag.se" />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">
                Telefon
                </label>
                <Input value={business.phone} placeholder="+46..." />
            </div>

            </CardContent>
        </Card>

        {/* Location */}
        <Card>
            <CardHeader>
            <CardTitle>Adress</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

            <div className="space-y-1">
                <label className="text-sm font-medium">
                Gatuadress
                </label>
                <Input value={business.address} placeholder="Storgatan 12" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                <label className="text-sm font-medium">
                    Stad
                </label>
                <Input placeholder="Göteborg" />
                </div>

                <div className="space-y-1">
                <label className="text-sm font-medium">
                    Postnummer
                </label>
                <Input placeholder="411 01" />
                </div>
            </div>

            </CardContent>
        </Card>

        {/* Optional social */}
        <Card>
            <CardHeader>
            <CardTitle>Sociala medier</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

            <div className="space-y-1">
                <label className="text-sm font-medium">
                Instagram
                </label>
                <Input
                    //value={businessSettings.instagram}
                    placeholder="@dittinstagramkonto" />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">
                Facebook
                </label>
                <Input
                    //value={businessSettings.facebook}
                    placeholder="@dittfacebookkonto" />
            </div>

            </CardContent>
        </Card>

        {/* Bottom save (backup) */}
        <div className="flex justify-end">
            <Button className="w-full sm:w-auto">
            Spara ändringar
            </Button>
        </div>

        </div>
    )
}

export default Profile