import { Button } from "@/components/ui/button"
import { routes } from "@/lib/routes";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Om Fade Studio</h1>
        <p className="text-lg text-muted-foreground">
          Modern barberarkonst med fokus på precision, stil och kvalitet.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Vår historia</h2>
        <p className="leading-7 text-muted-foreground">
          Fade Studio grundades med en enkel vision – att erbjuda förstklassiga
          klippningar i en modern och avslappnad miljö. Vi kombinerar klassiskt
          hantverk med dagens trender för att ge varje kund en look som känns
          både personlig och tidlös.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Vad vi erbjuder</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border rounded-lg p-5">
            <h3 className="font-semibold mb-2">Fades & Klippningar</h3>
            <p className="text-muted-foreground">
              Skarpa fades, moderna frisyrer och klassiska klippningar med
              noggrann precision.
            </p>
          </div>

          <div className="border rounded-lg p-5">
            <h3 className="font-semibold mb-2">Skäggvård</h3>
            <p className="text-muted-foreground">
              Professionell trimning och formning för ett välvårdat resultat.
            </p>
          </div>

          <div className="border rounded-lg p-5">
            <h3 className="font-semibold mb-2">Personlig Service</h3>
            <p className="text-muted-foreground">
              Vi tar oss tid att förstå din stil och ge rekommendationer som
              passar dig.
            </p>
          </div>

          <div className="border rounded-lg p-5">
            <h3 className="font-semibold mb-2">Kvalitet i Fokus</h3>
            <p className="text-muted-foreground">
              Varje detalj räknas – från första konsultationen till sista
              finishen.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Varför välja oss?</h2>
        <ul className="space-y-3">
          <li>✓ Erfarna barberare</li>
          <li>✓ Moderna tekniker och trender</li>
          <li>✓ Hög kvalitet på varje klippning</li>
          <li>✓ Avslappnad och välkomnande miljö</li>
          <li>✓ Enkel onlinebokning</li>
        </ul>
      </section>

      <section className="text-center border rounded-xl p-8">
        <h2 className="text-2xl font-semibold mb-4">
          Redo för nästa klippning?
        </h2>
        <p className="text-muted-foreground mb-6">
          Boka din tid idag och upplev skillnaden hos Fade Studio.
        </p>

        <Link href={routes.booking}>
          <Button className="px-6 py-3">
            Boka nu
          </Button>
        </Link>
      </section>
    </main>
  );
}