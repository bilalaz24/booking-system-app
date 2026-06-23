import Link from "next/link"
import { routes } from "@/lib/routes"
import { useBusiness } from "./providers/BusinessProvider"
import { getCurrentBusiness } from "@/lib/business/getCurrentBusiness"

const Footer = async () => {
  const { business, settings } = await getCurrentBusiness()
  const PLATFORM = "RiseDigital"

  return (
    <footer
      className="
        mt-24
        border-t
        border-border/40
        bg-navfoot-bg/90
        backdrop-blur-xl
      "
    >
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-12">

        <div className="grid gap-10 md:grid-cols-3">

          {/* Business */}
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {business?.name || "Business"}
            </h2>

            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              {settings?.hero_description || "Vi erbjuder professionella tjänster för att möta dina behov. Boka en tid idag och upplev skillnaden!"}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 font-semibold">
              Navigation
            </h3>

            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  className="transition-colors hover:text-foreground"
                  href={routes.home}
                >
                  Hem
                </Link>
              </li>

              <li>
                <Link
                  className="transition-colors hover:text-foreground"
                  href={routes.services}
                >
                  Tjänster
                </Link>
              </li>

              <li>
                <Link
                  className="transition-colors hover:text-foreground"
                  href={routes.about}
                >
                  Om oss
                </Link>
              </li>

              <li>
                <Link
                  className="transition-colors hover:text-foreground"
                  href={routes.contact}
                >
                  Kontakta
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Admin */}
          <div>
            <h3 className="mb-4 font-semibold">
              Information
            </h3>

            <div className="space-y-3 text-sm text-muted-foreground">

              <p>
                Onlinebokning dygnet runt.
              </p>

              <Link
                href={routes.booking}
                className="
                  inline-block
                  transition-colors
                  hover:text-foreground
                "
              >
                Boka tid →
              </Link>

              <div className="pt-2">
                <Link
                  href={routes.staffOverview}
                  className="
                    text-xs
                    opacity-60
                    transition-opacity
                    hover:opacity-100
                  "
                >
                  Personalportal
                </Link>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div
          className="
            mt-10
            flex
            flex-col
            gap-3
            border-t
            border-border/30
            pt-6
            text-sm
            text-muted-foreground
            md:flex-row
            md:items-center
            md:justify-between
          "
        >
          <p>
            © {new Date().getFullYear()} {business?.name || "Business"}.
            Alla rättigheter förbehållna.
          </p>

          <p className="text-xs opacity-60">
            Powered by {PLATFORM}
          </p>
        </div>

      </div>
    </footer>
  )
}

export default Footer