"use client"

import React from 'react'
import { bookAppointment } from '@/app/actions/book'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Field, FieldGroup, FieldLabel } from '../ui/field'
import { Button } from '../ui/button'
import { toast } from 'sonner'

interface Props {
    selectedDate: Date | null
    selectedSlot: string | null
}

const ContactInfo = ({ selectedDate, selectedSlot }: Props) => {
  return (
    <div className='flex-1'>
        <Card className='max-w-md w-full'>
            <CardHeader>
                <CardTitle>Boka</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={bookAppointment}   onSubmit={(e) => {
                    if (!selectedDate || !selectedSlot) {
                        e.preventDefault()
                    }
                }}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Namn</FieldLabel>
                            <Input name="name" id='name' type='text' required />
                        </Field>
                        <Field>
                            <FieldLabel>Email</FieldLabel>
                            <Input name='email' id='email' type='email' required />
                        </Field>
                        <Field>
                            <FieldLabel>Phone</FieldLabel>
                            <Input name='phone' id='phone' type='tel' required />
                        </Field>

                        <input
                            type="hidden"
                            name="date"
                            value={selectedDate?.toISOString() ?? ""}
                            required
                        />

                        <input
                            type="hidden"
                            name="slot"
                            value={selectedSlot ?? ""}
                            required
                        />

                        <Field>
                            <Button type='submit' onClick={() =>
                                toast("Din bokning lyckades", {
                                    description: `${selectedDate?.toLocaleDateString()} - ${selectedSlot}`
                                })
                            }>Boka nu</Button>
                        </Field>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    </div>
  )
}

export default ContactInfo