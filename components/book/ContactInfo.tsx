"use client"

import React, { useActionState, useEffect } from 'react'
import { bookAppointment } from '@/lib/actions/book'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Field, FieldGroup, FieldLabel } from '../ui/field'
import { Button } from '../ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface Props {
    selectedDate: Date | null
    selectedSlot: string | null
    selectedService: string | null
}

const ContactInfo = ({ selectedDate, selectedSlot, selectedService }: Props) => {
    const [state, action, pending] = useActionState(bookAppointment, null)

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
    }, [state])

    return (
        <div className='flex-1'>
            <Card className='max-w-md w-full'>
                <CardHeader>
                    <CardTitle>Boka</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={action}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Namn</FieldLabel>
                                <Input name="name" id='name' type='text' required />
                            </Field>
                            <Field>
                                <FieldLabel>Email</FieldLabel>
                                <Input name='email' id='email' type='email' />
                            </Field>
                            <Field>
                                <FieldLabel>Phone</FieldLabel>
                                <Input name='phone' id='phone' type='tel' required />
                            </Field>

                            <input
                                type="hidden"
                                name="date"
                                value={selectedDate?.toLocaleDateString("en-CA") ?? ""}
                                required
                            />

                            <input
                                type="hidden"
                                name="slot"
                                value={selectedSlot ?? ""}
                                required
                            />

                            <input
                                type="hidden"
                                name="service"
                                value={selectedService ?? ""}
                                required
                            />

                            <Field>
                                <Button type='submit' disabled={pending}>{ pending ? (<div className='flex justify-center items-center gap-x-1'><Loader2 /><p>Bokar...</p></div>) :  "Boka nu" }</Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default ContactInfo