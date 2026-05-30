"use client"

import React, { useActionState, useEffect } from 'react'
import { bookAppointment } from '@/lib/actions/book'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import z from 'zod'
import { bookingSchema } from '@/app/schemas/booking'
import { useRouter } from 'next/navigation'
import { routes } from '@/lib/routes'

type BookingFormValues = z.infer<typeof bookingSchema>

interface Props {
    selectedDate: Date | null
    selectedSlot: string | null
    selectedService: string | null
}

const ContactInfo = ({ selectedDate, selectedSlot, selectedService }: Props) => {
    const router = useRouter()

    const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<BookingFormValues>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            name: '',
            email: '',
            date: '',
            phone: '',
            service: '',
            slot: '',
        }
    })

    //const [state, action, pending] = useActionState(bookAppointment, null)

    /*
    useEffect(() => {
        if (!state) return

        if (state?.success) {
            toast.success("Din bokning lyckades", {
                description: `${state.date} - ${state.slot}`
            })
        }

        if (state?.error) {
            toast.error(state.error)
        }
    }, [state])*/

    useEffect(() => {
        setValue(
            "date",
            selectedDate?.toLocaleDateString("en-CA") ?? ""
        )
        
        setValue("slot", selectedSlot ?? "")
        setValue("service", selectedService ?? "")
    }, [selectedDate, selectedSlot, selectedService, setValue])

    const onSubmit = async (data: BookingFormValues) => {
        const result = await bookAppointment(data)

        if (result.success) {
            toast.success("Din bokning lyckades", {
                description: `${result.date} - ${result.slot}`
            })
            router.push(routes.home)
        }

        if (result.error) {
            toast.error(result.error)
        }
    }

    return (
        <div className='flex-1 w-full flex justify-center border-1 border-b-muted rounded-2xl py-8'>
            <Card className='max-w-md w-full'>
                <CardHeader>
                    <CardTitle>Boka</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <Controller name='name' control={control} render={({ field }) => (
                                <Field>
                                    <FieldLabel>Namn <span className='text-barber-red'>*</span></FieldLabel>
                                    <Input type='text' {...field} />
                                    {errors.name && (
                                        <FieldError errors={[errors.name]} />
                                    )}
                                </Field>
                            )} />
                            <Controller name='phone' control={control} render={({ field }) => (
                                <Field>
                                    <FieldLabel>Telefon <span className='text-barber-red'>*</span></FieldLabel>
                                    <Input type='tel' required {...field} />
                                    {errors.phone && (
                                        <FieldError errors={[errors.phone]} />
                                    )}
                                </Field>
                            )} />
                            <Controller name='email' control={control} render={({ field }) => (
                                <Field>
                                    <FieldLabel>Email</FieldLabel>
                                    <Input type='email' {...field} />
                                    {errors.email && (
                                      <FieldError errors={[errors.email]} />
                                    )}
                                </Field>
                            )} />

                            <Field>
                                <Button type='submit' disabled={isSubmitting}>
                                    {
                                        isSubmitting ? (
                                            <div className='flex justify-center items-center gap-x-1'>
                                                <Loader2 className='animate-spin' /><p>Bokar...</p>
                                            </div>) : "Boka nu"
                                    }
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default ContactInfo