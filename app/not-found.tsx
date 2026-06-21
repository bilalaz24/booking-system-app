import Link from "next/link"
import { Home, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"

import { routes } from "@/lib/routes"

export default function NotFound() {
  return (
    <main
      className="
        flex
        min-h-[70vh]
        items-center
        justify-center
        px-6
        py-16
      "
    >
      <Card
        className="
          w-full
          max-w-2xl
          border-border/50
          bg-navfoot-bg
          shadow-lg
        "
      >
        <CardContent className="p-10 sm:p-14">

          <div className="text-center">

            <div
              className="
                inline-flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-primary/10
                mb-6
              "
            >
              <Search className="h-8 w-8 text-primary" />
            </div>

            <p
              className="
                text-sm
                font-medium
                uppercase
                tracking-[0.25em]
                text-muted-foreground
              "
            >
              Error 404
            </p>

            <h1
              className="
                mt-4
                text-4xl
                font-bold
                tracking-tight
                sm:text-5xl
              "
            >
              Sidan hittades inte
            </h1>

            <p
              className="
                mx-auto
                mt-4
                max-w-md
                text-muted-foreground
              "
            >
              Sidan du försöker nå finns inte,
              har flyttats eller är inte längre
              tillgänglig.
            </p>

            <div
              className="
                mt-8
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:justify-center
              "
            >
              <Link href={routes.home}>
                <Button size="lg">
                  <Home className="mr-2 h-4 w-4" />
                  Till startsidan
                </Button>
              </Link>
            </div>

          </div>

        </CardContent>
      </Card>
    </main>
  )
}