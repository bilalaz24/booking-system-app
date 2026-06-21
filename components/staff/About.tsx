/*"use client"

import React from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field"

import Loader from "../Loader"
import { toast } from "sonner"
import { aboutSchema } from "@/app/schemas/about_page"

import { Plus, Trash2 } from "lucide-react"

// import these when you create them
// import { aboutSchema, AboutFormValues } from "@/app/schemas/about"
// import { updateAboutPage } from "@/lib/actions/staffAbout"

type AboutFormValues = {
  hero_description: string
  story_content: string

  services: {
    title: string
    description: string
  }[]

  why_us: string[]

  cta_title: string
  cta_description: string
}

const SettingsAbout = () => {
  const {
    control,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<AboutFormValues>({
    resolver: zodResolver(aboutSchema),

    defaultValues: {
      hero_description: "",

      story_content: "",

      services: [
        {
          title: "",
          description: "",
        },
      ],

      why_us: [""],

      cta_title: "",
      cta_description: "",
    },
  })

  const {
    fields: serviceFields,
    append: appendService,
    remove: removeService,
  } = useFieldArray({
    control,
    name: "services",
  })

  const {
    fields: whyUsFields,
    append: appendWhyUs,
    remove: removeWhyUs,
  } = useFieldArray({
    control,
    name: "why_us",
  })

  const onSubmit = async (
    data: AboutFormValues
  ) => {
    console.log(data)

    // const result =
    //   await updateAboutPage(data)

    toast.success(
      "Om oss-sidan sparades"
    )
  }

  return (
    <div className="max-w-4xl space-y-6">

      <div>
        <h1 className="text-2xl font-semibold">
          Redigera Om oss
        </h1>

        <p className="text-sm text-muted-foreground">
          Hantera innehållet på
          er Om oss-sida
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >


        <Card>
          <CardHeader>
            <CardTitle>
              Hero-sektion
            </CardTitle>
          </CardHeader>

          <CardContent>
            <FieldGroup>
              <Controller
                name="hero_description"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>
                      Kort beskrivning
                    </FieldLabel>

                    <Textarea
                      className="min-h-[120px]"
                      placeholder="Beskriv verksamheten..."
                      {...field}
                    />

                    {errors.hero_description && (
                      <FieldError
                        errors={[
                          errors.hero_description,
                        ]}
                      />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>



        <Card>
          <CardHeader>
            <CardTitle>
              Vår historia
            </CardTitle>
          </CardHeader>

          <CardContent>
            <FieldGroup>
              <Controller
                name="story_content"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>
                      Historiatext
                    </FieldLabel>

                    <Textarea
                      className="min-h-[220px]"
                      placeholder="Berätta er historia..."
                      {...field}
                    />

                    {errors.story_content && (
                      <FieldError
                        errors={[
                          errors.story_content,
                        ]}
                      />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle>
              Vad vi erbjuder
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {serviceFields.map(
              (service, index) => (
                <Card key={service.id}>
                  <CardContent className="pt-6 space-y-4">
                    <Controller
                      control={control}
                      name={`services.${index}.title`}
                      render={({ field }) => (
                        <Field>
                          <FieldLabel>
                            Titel
                          </FieldLabel>

                          <Input
                            placeholder="T.ex. Herrklippning"
                            {...field}
                          />
                        </Field>
                      )}
                    />

                    <Controller
                      control={control}
                      name={`services.${index}.description`}
                      render={({ field }) => (
                        <Field>
                          <FieldLabel>
                            Beskrivning
                          </FieldLabel>

                          <Textarea
                            className="min-h-[100px]"
                            placeholder="Beskriv tjänsten..."
                            {...field}
                          />
                        </Field>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          removeService(index)
                        }
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Ta bort
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                appendService({
                  title: "",
                  description: "",
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Lägg till tjänst
            </Button>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle>
              Varför välja oss
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {whyUsFields.map(
              (field, index) => (
                <div
                  key={field.id}
                  className="flex gap-2"
                >
                  <Controller
                    control={control}
                    name={`why_us.${index}`}
                    render={({ field }) => (
                      <Input
                        placeholder="Anledning"
                        {...field}
                      />
                    )}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      removeWhyUs(index)
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                appendWhyUs({ title: "", description: "" })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Lägg till anledning
            </Button>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle>
              Call To Action
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Controller
              name="cta_title"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>
                    CTA-rubrik
                  </FieldLabel>

                  <Input
                    placeholder="Redo att boka?"
                    {...field}
                  />
                </Field>
              )}
            />

            <Controller
              name="cta_description"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>
                    CTA-beskrivning
                  </FieldLabel>

                  <Textarea
                    className="min-h-[100px]"
                    placeholder="Beskriv CTA..."
                    {...field}
                  />
                </Field>
              )}
            />
          </CardContent>
        </Card>


        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
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

export default SettingsAbout*/
import React from 'react'

const SettingsAbout = () => {
    return (
        <div>SettingsAbout</div>
    )
}

export default SettingsAbout