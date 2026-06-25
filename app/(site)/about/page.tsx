import { Button } from "@/components/ui/button"
import { getCurrentBusiness } from "@/lib/business/getCurrentBusiness"
import { routes } from "@/lib/routes"
import { createClient } from "@/lib/supabase/server"
import { AboutService } from "@/lib/types"
import { cookies } from "next/headers"
import Link from "next/link"

export default async function AboutPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {business} = await getCurrentBusiness()

  if (!business) {
    throw new Error("Business not found, cannot render about page")
  }

  const businessName = business.name
  console.log("ABOUT PAGE BUSINESS ID: ",business.id)
  const { data: about, error } = await supabase.from("about_page").select("*").eq("business_id", business.id).single()

  if (!about) {
    console.error("About page data not found for business id:", business.id)
  }
  if (error) {
    console.error("Error fetching about page", error)
  }


  const emptyFields = Object.entries(about)
  .filter(([_, value]) => value === null || value === "")
  .map(([key]) => key);

  console.log(emptyFields)
  console.log(about)

  return (
    <main className=" max-w-5xl mx-auto px-6 py-20">

      {/* background glow */}
      <div className="absolute inset-0 -z-10" />

      {/* HERO */}
      <section className="text-center mb-20">
        <div className="inline-block px-4 py-1 rounded-full bg-highlight/10 text-highlight text-sm mb-4">
          {businessName}
        </div>

        <h1 className="text-5xl font-bold mb-4 tracking-tight pt-2">
          Om {businessName}
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {about.hero_description} {/*Modern barberarkonst med fokus på precision, stil och kvalitet.*/}
        </p>
      </section>

      {/* STORY */}
      <section className="mb-20">
        <div className="bg-card border rounded-2xl p-8 shadow-sm hover:shadow-md transition">
          <h2 className="text-2xl font-semibold mb-4">Vår historia</h2>
          <p className="leading-7 text-muted-foreground">
            {about.story_content}
          </p>
        </div>
      </section>

      {/* SERVICES */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Vad vi erbjuder
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          {about.services.map((service: AboutService) => (
            <div
              key={service.title}
              className="
                group
                border
                rounded-2xl
                p-6
                bg-card
                transition-all
                hover:border-highlight/50
                hover:shadow-md
                hover:-translate-y-1
              "
            >
              <h4 className="font-semibold text-lg mb-2 group-hover:text-highlight transition">
                {service.title}
              </h4>
              <p className="text-muted-foreground text-sm leading-6">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Varför välja oss?
        </h2>

        <div className="bg-card border rounded-2xl p-8">
          <ul className="grid gap-3 sm:grid-cols-2 text-muted-foreground">
            {
              about.why_us.map((item: string) => (
                <li key={item}>✓ {item}</li>
              ))
            }
            {/*<li>✓ Moderna tekniker och trender</li>
            <li>✓ Hög kvalitet på varje klippning</li>
            <li>✓ Avslappnad och välkomnande miljö</li>
            <li>✓ Enkel onlinebokning</li>*/}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <div className="relative overflow-hidden rounded-2xl border p-10 bg-card">
          {/* glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-primary/10 opacity-40" />

          <div className="relative">
            <h2 className="text-2xl font-semibold mb-3">
              {about.cta_title || "Redo för att prova själv?"}
            </h2>

            <p className="text-muted-foreground mb-6">
              {about.cta_description || `Boka din tid idag och upplev skillnaden hos ${businessName}`}
            </p>

            <Link href={routes.booking}>
              <Button className="px-6 py-5 text-base bg-primary hover:bg-primary/90">
                Boka nu
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}