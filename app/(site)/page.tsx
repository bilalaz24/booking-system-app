import { getCurrentBusiness } from "@/lib/business/getCurrentBusiness";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { routes } from "@/lib/routes";

export default async function Home() {
  const { business, settings } = await getCurrentBusiness();

  if (!business || !settings) {
    console.error("Error fetching business from home page");
    return null;
  }

  return (
    <main className="relative overflow-x-hidden">

      {/* background glow (does NOT affect layout now) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 right-[-120px] h-[650px] w-[650px] rounded-full bg-primary/10 blur-[200px]" />
        <div className="absolute bottom-[-180px] left-[-140px] h-[700px] w-[700px] rounded-full bg-primary/10 blur-[220px]" />
      </div>

      {/* HERO */}
      <section className="flex min-h-[92vh] items-center px-6">
        <div className="mx-auto w-full max-w-5xl text-center">

          {/* badge */}
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-primary" />
            {business.name} • {business.city}
          </div>

          {/* headline */}
          <h1 className="mt-8 text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
            {settings.hero_title}
          </h1>

          {/* subtext */}
          <p className="mt-6 mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
            {settings.hero_description}
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href={routes.booking}>
              <Button size="lg" className="px-8">
                Book appointment
              </Button>
            </Link>

            <Link href={routes.contact}>
              <Button size="lg" variant="outline" className="px-8">
                Contact
              </Button>
            </Link>
          </div>

          {/* quick info */}
          <div className="mt-16 flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground">
            <span>{business.email}</span>
            <span>{business.phone}</span>
            <span>{business.address}</span>
          </div>

        </div>
      </section>

      {/* divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* FOOTER */}
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-3">

          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Business
            </p>
            <p className="mt-3 text-xl font-medium">{business.name}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Contact
            </p>
            <div className="mt-3 space-y-1 text-muted-foreground">
              <p>{business.email}</p>
              <p>{business.phone}</p>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Location
            </p>
            <div className="mt-3 space-y-1 text-muted-foreground">
              <p>{business.address}</p>
              <p>{business.city}</p>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}