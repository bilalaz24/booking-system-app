"use client"

import React, { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { ContactValues, contactSchema } from "@/app/schemas/contact"
import { sendContactMessage } from "@/lib/actions/message"
import { toast } from "sonner"

export default function ContactForm() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  })

  const onSubmit = async (data: ContactValues) => {
    console.log(data)
    const result = await sendContactMessage(data)

    if (result?.success) {
        toast.success("Ditt meddelande skickades, vi återkommer så snart som möjligt!")
    }

    if (result?.error) {
        toast.error(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>

        {/* NAME */}
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Namn</FieldLabel>
              <Input
                placeholder="Ditt fullständiga namn"
                className="h-12 px-4 text-base"
                {...field}
              />
              {errors.name && (
                <FieldError errors={[errors.name]} />
              )}
            </Field>
          )}
        />

        {/* EMAIL */}
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>E-postadress</FieldLabel>
              <Input
                type="email"
                placeholder="namn@exempel.se"
                className="h-12 px-4 text-base"
                {...field}
              />
              {errors.email && (
                <FieldError errors={[errors.email]} />
              )}
            </Field>
          )}
        />

        {/* SUBJECT */}
        <Controller
          name="subject"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Ämne</FieldLabel>
              <Input
                placeholder="Vad gäller ditt ärende?"
                className="h-12 px-4 text-base"
                {...field}
              />
              {errors.subject && (
                <FieldError errors={[errors.subject]} />
              )}
            </Field>
          )}
        />

        {/* MESSAGE */}
        <Controller
          name="message"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Meddelande</FieldLabel>
              <Textarea
                placeholder="Skriv ditt meddelande här..."
                className="min-h-[160px] p-4 text-base resize-none leading-relaxed"
                {...field}
              />
              {errors.message && (
                <FieldError errors={[errors.message]} />
              )}
            </Field>
          )}
        />

        {/* SUBMIT */}
        <Field>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8"
          >
            {isSubmitting ? "Skickar..." : "Skicka meddelande"}
          </Button>
        </Field>

      </FieldGroup>
    </form>
  )
}