"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import { createClient } from "@/lib/supabase/client"
import { useBusiness } from "../providers/BusinessProvider"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { businessProfileSchema } from "@/app/schemas/business"
import { ProfileFormValues } from "@/app/schemas/business"
import Loader from "../Loader"
import { updateBusiness } from "@/lib/actions/staffBusiness"
import { toast } from "sonner"

const Profile = () => {
    const supabase = createClient()
    const {business, settings} = useBusiness()
    const { control, handleSubmit, formState: { errors, isDirty, isSubmitting } } = useForm<ProfileFormValues>({
        resolver: zodResolver(businessProfileSchema),
        defaultValues: {
            name: business.name,
            hero_title: settings.hero_title,
            hero_description: settings.hero_description,

            address: business.address,
            city: business.city,

            phone: business.phone,
            email: business.email,

            instagram: settings.instagram_url,
            facebook: settings.facebook_url,
        }
    })

    const onSubmit = async (data: ProfileFormValues) => {
        console.log(data)
        const result = await updateBusiness(data)

        if (result?.success) {
            toast.success("Företagsprofil updaterades")
        }

        if (result?.error) {
            toast.error(result.error)
        }
    }

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Grundinformation</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">

                    <FieldGroup>
                        <Controller name='name' control={control} render={({ field }) => (
                            <Field>
                                <FieldLabel>Företagsnamn</FieldLabel>
                                <Input type='text' {...field} />
                                {errors.name && (
                                    <FieldError errors={[errors.name]} />
                                )}
                            </Field>
                        )} />
                    </FieldGroup>

                    <FieldGroup>
                        <Controller name='hero_title' control={control} render={({ field }) => (
                            <Field>
                                <FieldLabel>Hero-rubrik</FieldLabel>
                                <Input type="text" {...field} />
                                {errors.hero_title && (
                                    <FieldError errors={[errors.hero_title]} />
                                )}
                            </Field>
                        )} />
                    </FieldGroup>

                    <FieldGroup>
                        <Controller name='hero_description' control={control} render={({ field }) => (
                            <Field>
                                <FieldLabel>Beskrivning</FieldLabel>
                                <Textarea className="min-h-[100px]" {...field} />
                                {errors.hero_description && (
                                    <FieldError errors={[errors.hero_description]} />
                                )}
                            </Field>
                        )} />
                    </FieldGroup>

                </CardContent>
            </Card>

            {/* Contact */}
            <Card>
                <CardHeader>
                <CardTitle>Kontakt</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">

                    <FieldGroup>
                        <Controller name='email' control={control} render={({ field }) => (
                            <Field>
                                <FieldLabel>E-post</FieldLabel>
                                <Input type="email" {...field} />
                                {errors.email && (
                                    <FieldError errors={[errors.email]} />
                                )}
                            </Field>
                        )} />
                    </FieldGroup>

                    <FieldGroup>
                        <Controller name='phone' control={control} render={({ field }) => (
                            <Field>
                                <FieldLabel>Telefon</FieldLabel>
                                <Input type="tel" {...field} />
                                {errors.phone && (
                                    <FieldError errors={[errors.phone]} />
                                )}
                            </Field>
                        )} />
                    </FieldGroup>

                    <div className="grid grid-cols-2 gap-4">

                        <FieldGroup>
                            <Controller name='address' control={control} render={({ field }) => (
                                <Field>
                                    <FieldLabel>Gatuaddress</FieldLabel>
                                    <Input type="text" {...field} />
                                    {errors.address && (
                                        <FieldError errors={[errors.address]} />
                                    )}
                                </Field>
                            )} />
                        </FieldGroup>

                        <FieldGroup>
                            <Controller name='city' control={control} render={({ field }) => (
                                <Field>
                                    <FieldLabel>Stad</FieldLabel>
                                    <Input type="text" {...field} />
                                    {errors.city && (
                                        <FieldError errors={[errors.city]} />
                                    )}
                                </Field>
                            )} />
                        </FieldGroup>
                    </div>

                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle>Sociala medier</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">

                    <FieldGroup>
                        <Controller name='instagram' control={control} render={({ field }) => (
                            <Field>
                                <FieldLabel>Instagram</FieldLabel>
                                <Input type="text" {...field} />
                                {errors.instagram && (
                                    <FieldError errors={[errors.instagram]} />
                                )}
                            </Field>
                        )} />
                    </FieldGroup>

                    <FieldGroup>
                        <Controller name='facebook' control={control} render={({ field }) => (
                            <Field>
                                <FieldLabel>Facebook</FieldLabel>
                                <Input type="text" {...field} />
                                {errors.facebook && (
                                    <FieldError errors={[errors.facebook]} />
                                )}
                            </Field>
                        )} />
                    </FieldGroup>

                </CardContent>
            </Card>

            <Button className="w-full sm:w-auto" type='submit' disabled={isSubmitting}>
                {
                    isSubmitting ? (
                        <div className='flex justify-center items-center gap-x-1'>
                            <Loader /><p>Sparar</p>
                        </div>) : "Spara ändringar"
                }
            </Button>
        </form>


        </div>
    )
}

export default Profile