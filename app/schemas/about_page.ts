import z from "zod"

export const aboutSchema = z.object({
  hero_description: z.string().min(10),

  story_content: z.string().min(50),

  services: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    })
  ),

  why_us: z.array(
    z.object({
      text: z.string().min(1),
    })
  ),

  cta_title: z.string().optional(),
  cta_description: z.string().optional(),
})

export type AboutFormValues =
  z.infer<typeof aboutSchema>