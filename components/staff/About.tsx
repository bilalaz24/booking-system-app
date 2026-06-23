"use client"

import React, { useEffect } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import { Field, FieldError, FieldLabel } from "../ui/field"

import Loader from "../Loader"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"

import { aboutSchema, AboutFormValues } from "@/app/schemas/about_page"
import { createClient } from "@/lib/supabase/client"

const SettingsAbout = () => {
  const supabase = createClient()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AboutFormValues>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      hero_description: "",
      story_content: "",
      services: [{ title: "", description: "" }],
      why_us: [{ text: "" }],
      cta_title: "",
      cta_description: "",
    },
  })

  const { fields: serviceFields, append: appendService, remove: removeService } =
    useFieldArray({ control, name: "services" })

  const { fields: whyUsFields, append: appendWhyUs, remove: removeWhyUs } =
    useFieldArray({ control, name: "why_us" })

  const fetchAbout = async () => {
    const { data } = await supabase.from("about_page").select("*").single()
    if (!data) return

    reset({
      hero_description: data.hero_description ?? "",
      story_content: data.story_content ?? "",
      services: data.services ?? [],
      why_us: (data.why_us ?? []).map((t: string) => ({ text: t })),
      cta_title: data.cta_title ?? "",
      cta_description: data.cta_description ?? "",
    })
  }

  useEffect(() => {
    fetchAbout()
  }, [])

  const onSubmit = async (data: AboutFormValues) => {
    console.log(data)
    toast.success("Sparat")
  }

  return (
    <div className="max-w-4xl space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Om oss</h1>
        <p className="text-sm text-muted-foreground">
          Redigera innehållet på sidan
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* HERO */}
        <Card>
          <CardHeader>
            <CardTitle>Hero</CardTitle>
          </CardHeader>

          <CardContent>
            <Controller
              name="hero_description"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Beskrivning</FieldLabel>
                  <Textarea {...field} />
                  <FieldError errors={[errors.hero_description]} />
                </Field>
              )}
            />
          </CardContent>
        </Card>

        {/* STORY */}
        <Card>
          <CardHeader>
            <CardTitle>Vår historia</CardTitle>
          </CardHeader>

          <CardContent>
            <Controller
              name="story_content"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Text</FieldLabel>
                  <Textarea className="min-h-[180px]" {...field} />
                  <FieldError errors={[errors.story_content]} />
                </Field>
              )}
            />
          </CardContent>
        </Card>

        {/* SERVICES */}
        <Card>
          <CardHeader>
            <CardTitle>Vad vi erbjuder</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {serviceFields.map((service, index) => (
              <div key={service.id} className="space-y-3 border rounded-md p-4">
                <div className="flex gap-2">
                  <Controller
                    control={control}
                    name={`services.${index}.title`}
                    render={({ field }) => (
                      <Input {...field} />
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    className="text-destructive hover:text-destructive/80"
                    onClick={() => removeService(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <Controller
                  control={control}
                  name={`services.${index}.description`}
                  render={({ field }) => (
                    <Textarea {...field} />
                  )}
                />
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
              onClick={() =>
                appendService({ title: "", description: "" })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Lägg till tjänst
            </Button>
          </CardContent>
        </Card>

        {/* WHY US */}
        <Card>
          <CardHeader>
            <CardTitle>Varför välja oss</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {whyUsFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Controller
                  control={control}
                  name={`why_us.${index}.text`}
                  render={({ field }) => (
                    <Input className="flex-1" {...field} />
                  )}
                />

                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:text-destructive/80"
                  onClick={() => removeWhyUs(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => appendWhyUs({ text: "" })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Lägg till
            </Button>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card>
          <CardHeader>
            <CardTitle>Call to Action</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Controller
              name="cta_title"
              control={control}
              render={({ field }) => (
                <Input {...field} />
              )}
            />

            <Controller
              name="cta_description"
              control={control}
              render={({ field }) => (
                <Textarea {...field} />
              )}
            />
          </CardContent>
        </Card>

        {/* SAVE */}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader />
              Sparar...
            </div>
          ) : (
            "Spara ändringar"
          )}
        </Button>

      </form>
    </div>
  )
}

export default SettingsAbout