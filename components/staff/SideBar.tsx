"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useBusiness } from "../providers/BusinessProvider"
import { routes } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import {
  Calendar,
  ChevronDown,
  Clock,
  Home,
  Menu,
  Package,
  Settings2,
  UserCircle2,
  X,
  LogOut,
} from "lucide-react"

function Links({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  const [dropdown, setDropdown] = useState(
    pathname.startsWith("/staff/settings")
  )

  const logout = async () => {
    await supabase.auth.signOut()
    router.push(routes.home)
  }

  const linkClass = (href: string) =>
    cn(
      `
        flex
        items-center
        rounded-xl
        px-4
        py-3
        text-sm
        font-medium
        transition-all
        duration-200
      `,
      pathname === href
        ? `
            bg-accent/10
            text-accent
            border
            border-accent/20
          `
        : `
            text-muted-foreground
            hover:bg-muted/50
            hover:text-foreground
            hover:translate-x-1
          `
    )

  return (
    <div className="flex h-full flex-col">

      <nav className="space-y-2">

        <Link
          href={routes.staffOverview}
          className={linkClass(routes.staffOverview)}
          onClick={onNavigate}
        >
          <Home className="mr-3 h-4 w-4" />
          Översikt
        </Link>

        <Link
          href={routes.staffBookings}
          className={linkClass(routes.staffBookings)}
          onClick={onNavigate}
        >
          <Calendar className="mr-3 h-4 w-4" />
          Bokningar
        </Link>

        <button
          onClick={() => setDropdown(!dropdown)}
          className="
            flex
            w-full
            items-center
            justify-between
            rounded-xl
            px-4
            py-3
            text-sm
            font-medium
            text-muted-foreground
            transition-all
            duration-200
            hover:bg-muted/50
            hover:text-foreground
          "
        >
          <span className="flex items-center">
            <Settings2 className="mr-3 h-4 w-4" />
            Inställningar
          </span>

          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              dropdown && "rotate-180"
            )}
          />
        </button>

        <div
          className={cn(
            `
              overflow-hidden
              transition-all
              duration-300
            `,
            dropdown
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0"
          )}
        >
          <div
            className="
              ml-3
              mt-2
              space-y-1
              rounded-xl
              border
              border-border/30
              bg-muted/20
              p-2
            "
          >
            <Link
              href={routes.staffSettingsProfile}
              className={linkClass(routes.staffSettingsProfile)}
              onClick={onNavigate}
            >
              <UserCircle2 className="mr-3 h-4 w-4" />
              Profil
            </Link>

            <Link
              href={routes.staffSettingsHours}
              className={linkClass(routes.staffSettingsHours)}
              onClick={onNavigate}
            >
              <Clock className="mr-3 h-4 w-4" />
              Öppettider
            </Link>

            <Link
              href={routes.staffSettingsServices}
              className={linkClass(routes.staffSettingsServices)}
              onClick={onNavigate}
            >
              <Package className="mr-3 h-4 w-4" />
              Tjänster
            </Link>
          </div>
        </div>

      </nav>

      <div className="mt-auto pt-6">
        <Button
          variant="outline"
          onClick={logout}
          className="
            w-full
            justify-start
            gap-2
            border-border/40
            bg-transparent
            hover:bg-muted/50
          "
        >
          <LogOut className="h-4 w-4" />
          Logga ut
        </Button>
      </div>

    </div>
  )
}

export default function SideBar() {
  const { business } = useBusiness()

  const [open, setOpen] = useState(false)

  return (
    <>
      {/* DESKTOP */}
      <aside
        className="
          hidden
          md:flex
          fixed
          top-0
          left-0
          z-40
          h-screen
          w-72
          flex-col
          border-r
          border-border/40
          bg-navfoot-bg/90
          backdrop-blur-xl
          p-6
        "
      >
        <div className="border-b border-border/30 pb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Admin Panel
          </p>

          <h1 className="mt-2 text-xl font-bold tracking-tight">
            {business.name}
          </h1>
        </div>

        <div className="mt-6 flex-1">
          <Links />
        </div>

        <div className="border-t border-border/30 pt-4">
          <p className="text-xs text-muted-foreground">
            Staff Dashboard
          </p>

          <p className="mt-1 text-xs text-muted-foreground/70">
            {business.name}
          </p>
        </div>
      </aside>

      {/* MOBILE */}
      <div className="md:hidden">

        {/* TOP BAR */}
        <div
          className="
            fixed
            top-0
            left-0
            z-30
            w-full
            border-b
            border-border/40
            bg-navfoot-bg/90
            backdrop-blur-xl
          "
        >
          <div className="relative flex h-16 items-center justify-center">

            <Button
              variant="ghost"
              size="icon"
              className="absolute left-3"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <h1 className="text-sm font-semibold">
              {business.name}
            </h1>

          </div>
        </div>

        {/* OVERLAY */}
        <div
          onClick={() => setOpen(false)}
          className={cn(
            `
              fixed
              inset-0
              z-40
              bg-black/70
              backdrop-blur-sm
              transition-opacity
              duration-300
            `,
            open
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          )}
        />

        {/* DRAWER */}
        <aside
          className={cn(
            `
              fixed
              top-0
              left-0
              z-50
              flex
              h-screen
              w-72
              flex-col
              border-r
              border-border/40
              bg-navfoot-bg/95
              backdrop-blur-xl
              p-6
              shadow-2xl
              transition-transform
              duration-300
            `,
            open
              ? "translate-x-0"
              : "-translate-x-full"
          )}
        >
          <div className="flex items-start justify-between border-b border-border/30 pb-6">

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Admin Panel
              </p>

              <h1 className="mt-2 text-xl font-bold tracking-tight">
                {business.name}
              </h1>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>

          </div>

          <div className="mt-6 flex-1">
            <Links onNavigate={() => setOpen(false)} />
          </div>

          <div className="border-t border-border/30 pt-4">
            <p className="text-xs text-muted-foreground">
              Staff Dashboard
            </p>

            <p className="mt-1 text-xs text-muted-foreground/70">
              {business.name}
            </p>
          </div>
        </aside>

      </div>
    </>
  )
}