"use client"

import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import { useBusiness } from "../providers/BusinessProvider"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import { Label } from '../ui/label'
import { businessServicesFormSchema, ServicesFormValues } from '@/app/schemas/business'
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import Loader from '../Loader'
import { createClient } from '@/lib/supabase/client'
import { Plus } from 'lucide-react'
import { updateServices } from '@/lib/actions/staffServices'

const Services = () => {
    const supabase = createClient()

    const {business, settings} = useBusiness()

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ServicesFormValues>({
        resolver: zodResolver(businessServicesFormSchema),
        defaultValues: {
            services: [],
        },
    })

    const fetchServices = async () => {    
        if (!business?.id) return

        const { data: servicesData, error } = await supabase.from("services").select("*").eq("business_id", business.id)
    
        if (error) {
            console.error("Error fetching services", error)
            return
        }
    
        console.log("services data:", servicesData)

        replace(
        servicesData.map((s) => ({
            id: s.id,
            name: s.name,
            price: s.price,
            duration_min: s.duration_min,
            description: s.description ?? "",
        }))
        )
    }

    useEffect(() => {
        if (business) {
            fetchServices()
        }
    }, [business])


    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: "services",
    })

    async function onSubmit(data: ServicesFormValues) {
        console.log(data.services)
        await updateServices(data.services)
    }

    return (
        <div className="max-w-3xl space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">
                Redigera tjänster
                </h1>

                <p className="text-sm text-muted-foreground">
                Hantera företagets tjänster, priser och tider.
                </p>
            </div>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
            >
                {fields.map((field, index) => (
                <Card key={field.id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>
                        Tjänst {index + 1}
                    </CardTitle>

                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => remove(index)}
                    >
                        Ta bort
                    </Button>
                    </CardHeader>

                    <CardContent className="space-y-4">
                    <FieldGroup>
                        <Controller
                        name={`services.${index}.name`}
                        control={control}
                        render={({ field }) => (
                            <Field>
                            <FieldLabel>Namn</FieldLabel>

                            <Input {...field} />

                            {errors.services?.[index]?.name && (
                                <FieldError
                                errors={[
                                    errors.services[index]!.name!,
                                ]}
                                />
                            )}
                            </Field>
                        )}
                        />
                    </FieldGroup>

                    <div className="grid grid-cols-2 gap-4">
                        <FieldGroup>
                        <Controller
                            name={`services.${index}.price`}
                            control={control}
                            render={({ field }) => (
                            <Field>
                                <FieldLabel>Pris (kr)</FieldLabel>

                                <div className="relative">
                                    <Input
                                    type="text"
                                    inputMode="numeric"
                                    {...field}
                                    value={field.value ?? ""}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                        kr
                                    </span>
                                </div>

                                {errors.services?.[index]?.price && (
                                    <FieldError
                                    errors={[
                                        errors.services[index]!.price!,
                                    ]}
                                    />
                                )}
                            </Field>
                            )}
                        />
                        </FieldGroup>

                        <FieldGroup>
                        <Controller
                            name={`services.${index}.duration_min`}
                            control={control}
                            render={({ field }) => (
                            <Field>
                                <FieldLabel>Tid (min)</FieldLabel>

                                <div className="relative">
                                    <Input
                                    type="text"
                                    inputMode="numeric"
                                    {...field}
                                    value={field.value ?? ""}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                            min
                                    </span>
                                </div>

                                {errors.services?.[index]?.duration_min && (
                                    <FieldError
                                    errors={[
                                        errors.services[index]!.duration_min!,
                                    ]}
                                    />
                                )}
                            </Field>
                            )}
                        />
                        </FieldGroup>
                    </div>

                    <FieldGroup>
                        <Controller
                        name={`services.${index}.description`}
                        control={control}
                        render={({ field }) => (
                            <Field>
                                <FieldLabel>Beskrivning</FieldLabel>

                                <Textarea
                                    className="min-h-[100px]"
                                    {...field}
                                />

                                {errors.services?.[index]?.description && (
                                    <FieldError
                                    errors={[
                                        errors.services[index]!.description!,
                                    ]}
                                    />
                                )}
                            </Field>
                        )}
                        />
                    </FieldGroup>
                    </CardContent>
                </Card>
                ))}

                <Button
                type="button"
                variant="outline"
                className="flex w-full"
                onClick={() =>
                    append({
                    name: "",
                    description: "",
                    price: 0,
                    duration_min: 30,
                    })
                }
                >
                <Plus /> Lägg till tjänst
                </Button>

                <Button
                type="submit"
                disabled={isSubmitting}
                >
                {isSubmitting ? (
                    <div className="flex items-center gap-2">
                    <Loader />
                    <span>Sparar...</span>
                    </div>
                ) : (
                    "Spara ändringar"
                )}
                </Button>
            </form>
        </div>
    )
}

export default Services