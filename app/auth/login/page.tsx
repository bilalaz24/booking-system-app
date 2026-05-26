"use client"

import React, { useActionState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import z from 'zod'
import { useRouter } from 'next/navigation'
import { authSchema } from '@/app/schemas/auth'
import { createClient } from '@/lib/supabase/client'

type AuthSchemaValues = z.infer<typeof authSchema>

const LoginPage = () => {
    const supabase = createClient()
    const router = useRouter()

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<AuthSchemaValues>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    })

    const onSubmit = async (data: AuthSchemaValues) => {
        const {error} = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password
        })

        if (error) {
            console.error("Error logging in", error)
            return
        }

        router.push("/admin")
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
                            <Controller name='email' control={control} render={({ field }) => (
                                <Field>
                                    <FieldLabel>Email</FieldLabel>
                                    <Input type='email' {...field} />
                                    {errors.email && (
                                        <FieldError errors={[errors.email]} />
                                    )}
                                </Field>
                            )} />
                            <Controller name='password' control={control} render={({ field }) => (
                                <Field>
                                    <FieldLabel>Lösenord</FieldLabel>
                                    <Input type='password' {...field} />
                                    {errors.password && (
                                        <FieldError errors={[errors.password]} />
                                    )}
                                </Field>
                            )} />

                            <Field>
                                <Button type='submit' disabled={isSubmitting}>
                                    {
                                        isSubmitting ? (
                                            <div className='flex justify-center items-center gap-x-1'>
                                                <Loader2 className='animate-spin' /><p>Loggar in...</p>
                                            </div>) : "Logga in"
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

export default LoginPage