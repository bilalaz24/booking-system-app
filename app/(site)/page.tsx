import { getCurrentBusiness } from "@/lib/business/getCurrentBusiness";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { business, settings } = await getCurrentBusiness();

  const {data: services, error} = await supabase.from("services").select("*").eq("business_id", business?.id).eq("is_active", true)
  
  if (!business || !settings || !services || error) {
    console.error("Error fetching business from home page");
    return null;
  }

  return (
    <main className="relative overflow-x-hidden">

      {/* HERO (REAL LANDING STYLE) */}
      <section className="relative min-h-[92vh] flex items-center px-6">
        <div className="mx-auto w-full max-w-6xl grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div>

            <div className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              {business.name} • {business.city}
            </div>

            <h1 className="mt-6 text-5xl md:text-7xl leading-tight">
              {settings.hero_title}
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              {settings.hero_description}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href={routes.booking}>
                <Button size="lg" className="px-10 bg-primary text-black hover:bg-primary/90">
                  Boka tid
                </Button>
              </Link>

              <Link href={routes.contact}>
                <Button size="lg" variant="outline" className="px-10 border-primary/40 hover:border-primary/80">
                  Kontakt
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex gap-8 text-sm text-muted-foreground">
              <p>{business.phone}</p>
              <p>{business.email}</p>
            </div>
          </div>

          {/* RIGHT VISUAL PANEL (NOT A CARD GRID) */}
          <div className="relative">

            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent blur-2xl rounded-3xl" />

            <div className="relative rounded-3xl border border-border backdrop-blur-xl p-10 shadow-2xl">

              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Kontaktuppgifter
              </p>

              <h2 className="mt-3 text-2xl text-primary">
                {business.name}
              </h2>

              <p className="mt-4 text-muted-foreground">
                {business.address}
              </p>

              <p className="text-muted-foreground">
                {business.city}
              </p>

              <div className="mt-8 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

              <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                <p>{business.phone}</p>
                <p>{business.email}</p>
              </div>

              <div className="mt-8 flex gap-4 text-sm">
                <a href={`https://${settings.instagram_url}` || "*"} className="text-primary hover:underline">
                  Instagram
                </a>
                <a href={settings.facebook_url || "*"} className="text-primary hover:underline">
                  Facebook
                </a>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* TJÄNSTER */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">

          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              Tjänster
            </p>

            <h2 className="mt-4 text-4xl">
              Vad kan du boka?
            </h2>

            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Välj bland våra tjänster och boka en tid som passar dig.
            </p>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {services.map((service) => (
              <div
                key={service.id}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-3xl
                  border
                  border-border
                  p-8
                  backdrop-blur-xl
                  transition-all
                  duration-300
                  hover:border-primary/40
                  hover:-translate-y-1
                "
              >
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
                </div>

                <div className="relative">
                  <h3 className="text-xl">
                    {service.name}
                  </h3>

                  {service.description && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  )}

                  <div className="mt-8 flex items-center justify-between">

                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {service.price} kr
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {service.duration_min} min
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* CTA SECTION (BIG MOMENT) */}
      <section className="px-6 py-28">
        <div className="mx-auto max-w-5xl relative">

          <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-3xl" />

          <div className="relative text-center border border-primary/20 rounded-3xl p-12 backdrop-blur-xl">

            <h2 className="text-4xl md:text-5xl">
              Redo att boka
            </h2>

            <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
              Boka din tid hos {business.name} snabbt och smidigt online.
            </p>

            <div className="mt-10">
              <Link href={routes.booking}>
                <Button size="lg" className="px-14 bg-primary">
                  Boka tid
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}