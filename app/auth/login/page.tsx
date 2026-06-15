"use client"

import React, { useActionState, useEffect, useState } from 'react'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import z from 'zod'
import { useRouter } from 'next/navigation'
import { authSchema } from '@/app/schemas/auth'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { routes } from '@/lib/routes'
import Loader from '@/components/Loader'

type AuthSchemaValues = z.infer<typeof authSchema>

const LoginPage = () => {
    const supabase = createClient()
    const router = useRouter()

    const [authError, setAuthError] = useState("")

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
            if (error.message === "Invalid login credentials") {
                setAuthError("Fel e-post eller lösenord")
            } else {
                setAuthError("Något gick fel")
            }
            console.log("Error logging in", error)
            return
        }

        router.push(routes.staffOverview)
    }

    return (
        <div className='flex-1 w-full flex justify-center border-1 border-b-muted rounded-2xl py-8'>
            <Card className='max-w-md w-full'>
                <CardHeader>
                    <CardTitle>Personalinloggning</CardTitle>
                    <CardDescription>Endast behörig personal</CardDescription>
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

                            {
                                authError && (
                                    <p className='text-red-500 text-sm'>{authError}</p>
                                )
                            }

                            <Field>
                                <Button type='submit' disabled={isSubmitting}>
                                    {
                                        isSubmitting ? (
                                            <div className='flex justify-center items-center gap-x-1'>
                                                <Loader /><p>Loggar in...</p>
                                            </div>) : "Logga in"
                                    }
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                    <Button onClick={() => router.back()} className='bg-accent' disabled={isSubmitting}> <span> <ArrowLeft /> </span> Gå bak</Button>
                </CardContent>
            </Card>
        </div>
    )
}

export default LoginPage