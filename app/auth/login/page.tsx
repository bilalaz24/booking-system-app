"use client"

import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { useRouter } from "next/navigation"
import { authSchema } from "@/app/schemas/auth"
import { createClient } from "@/lib/supabase/client"
import { routes } from "@/lib/routes"
import Loader from "@/components/Loader"

type AuthSchemaValues = z.infer<typeof authSchema>

const LoginPage = () => {
  const supabase = createClient()
  const router = useRouter()

  const [authError, setAuthError] = useState("")

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthSchemaValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: AuthSchemaValues) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setAuthError(
        error.message === "Invalid login credentials"
          ? "Fel e-post eller lösenord"
          : "Något gick fel"
      )
      return
    }

    router.push(routes.staffOverview)
  }

  return (
    <div
      className="
        min-h-screen
        w-full
        flex
        items-center
        justify-center
        px-4
        py-16
        bg-gradient-to-b
        from-background
        to-muted/20
      "
    >
      <div className="w-full max-w-md space-y-6">

        {/* HEADER (this fixes your “cramped” feeling) */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Personalinloggning
          </h1>

          <p className="text-sm text-muted-foreground">
            Endast behörig personal har åtkomst till systemet
          </p>
        </div>

        {/* CARD */}
        <Card className="rounded-2xl border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Logga in</CardTitle>
            <CardDescription>
              Använd dina uppgifter för att fortsätta
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>

                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>E-post</FieldLabel>
                      <Input type="email" {...field} />
                      {errors.email && (
                        <FieldError errors={[errors.email]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Lösenord</FieldLabel>
                      <Input type="password" {...field} />
                      {errors.password && (
                        <FieldError errors={[errors.password]} />
                      )}
                    </Field>
                  )}
                />

                {authError && (
                  <p className="text-sm text-red-500">
                    {authError}
                  </p>
                )}

                <Field>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader />
                        <span>Loggar in...</span>
                      </div>
                    ) : (
                      "Logga in"
                    )}
                  </Button>
                </Field>

              </FieldGroup>
            </form>

            {/* BACK BUTTON */}
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="mt-4 w-full border-border/40"
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Gå bak
            </Button>
          </CardContent>
        </Card>

        {/* FOOTER NOTE */}
        <p className="text-center text-xs text-muted-foreground">
          Logga in för att hantera bokningar och schema
        </p>

      </div>
    </div>
  )
}

export default LoginPage