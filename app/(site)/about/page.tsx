import { Button } from "@/components/ui/button"
import { routes } from "@/lib/routes"
import Link from "next/link"

export default function AboutPage() {
  return (
    <main className="relative max-w-5xl mx-auto px-6 py-20">

      {/* background glow */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-black/5" />

      {/* HERO */}
      <section className="text-center mb-20">
        <div className="inline-block px-4 py-1 rounded-full bg-barber-red/10 text-barber-red text-sm mb-4">
          Fade Studio
        </div>

        <h1 className="text-5xl font-bold mb-4 tracking-tight">
          Om Fade Studio
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Modern barberarkonst med fokus på precision, stil och kvalitet.
        </p>
      </section>

      {/* STORY */}
      <section className="mb-20">
        <div className="bg-card border rounded-2xl p-8 shadow-sm hover:shadow-md transition">
          <h2 className="text-2xl font-semibold mb-4">Vår historia</h2>
          <p className="leading-7 text-muted-foreground">
            Fade Studio grundades med en enkel vision – att erbjuda förstklassiga
            klippningar i en modern och avslappnad miljö. Vi kombinerar klassiskt
            hantverk med dagens trender för att ge varje kund en look som känns
            både personlig och tidlös.
          </p>
        </div>
      </section>

      {/* SERVICES */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Vad vi erbjuder
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          {[
            {
              title: "Fades & Klippningar",
              desc: "Skarpa fades, moderna frisyrer och klassiska klippningar med noggrann precision.",
            },
            {
              title: "Skäggvård",
              desc: "Professionell trimning och formning för ett välvårdat resultat.",
            },
            {
              title: "Personlig Service",
              desc: "Vi tar oss tid att förstå din stil och ge rekommendationer som passar dig.",
            },
            {
              title: "Kvalitet i Fokus",
              desc: "Varje detalj räknas – från första konsultationen till sista finishen.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="
                group
                border
                rounded-2xl
                p-6
                bg-card
                transition-all
                hover:border-barber-red/50
                hover:shadow-md
                hover:-translate-y-1
              "
            >
              <h3 className="font-semibold text-lg mb-2 group-hover:text-barber-red transition">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-6">
                {item.desc}
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
            <li>✓ Erfarna barberare</li>
            <li>✓ Moderna tekniker och trender</li>
            <li>✓ Hög kvalitet på varje klippning</li>
            <li>✓ Avslappnad och välkomnande miljö</li>
            <li>✓ Enkel onlinebokning</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <div className="relative overflow-hidden rounded-2xl border p-10 bg-card">
          {/* glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-barber-red/10 via-transparent to-barber-blue/10 opacity-40" />

          <div className="relative">
            <h2 className="text-2xl font-semibold mb-3">
              Redo för nästa klippning?
            </h2>

            <p className="text-muted-foreground mb-6">
              Boka din tid idag och upplev skillnaden hos Fade Studio.
            </p>

            <Link href={routes.booking}>
              <Button className="px-6 py-5 text-base bg-barber-red hover:bg-barber-red/90">
                Boka nu
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}