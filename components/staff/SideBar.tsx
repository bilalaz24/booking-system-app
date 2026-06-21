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
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings2,
  UserCircle2,
  X,
} from "lucide-react"

function SidebarLinks({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [settingsOpen, setSettingsOpen] = useState(
    pathname.startsWith("/staff/settings")
  )

  const logout = async () => {
    await supabase.auth.signOut()
    router.push(routes.home)
  }

  const baseLink =
    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200"

  const linkClass = (href: string) =>
    cn(
      baseLink,
      pathname === href
        ? "bg-accent text-accent-foreground"
        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
    )

  return (
    <div className="flex h-full flex-col">

      {/* QUICK ACCESS (Messages) */}
      <div className="mb-5">
        <Link
          href={routes.staffMessages}
          onClick={onNavigate}
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-border/40
            bg-card
            px-4
            py-4
            transition-all
            duration-200
            hover:bg-muted/40
            hover:-translate-y-0.5
            hover:border-accent/40
          "
        >
          <MessageSquare className="h-5 w-5 text-accent" />

          <div className="leading-tight">
            <p className="text-sm font-semibold">
              Meddelanden
            </p>
            <p className="text-xs text-muted-foreground">
              Kundförfrågningar
            </p>
          </div>
        </Link>
      </div>

      {/* MAIN NAV */}
      <nav className="space-y-2">

        <Link
          href={routes.staffOverview}
          className={linkClass(routes.staffOverview)}
          onClick={onNavigate}
        >
          <Home className="h-4 w-4" />
          Översikt
        </Link>

        <Link
          href={routes.staffBookings}
          className={linkClass(routes.staffBookings)}
          onClick={onNavigate}
        >
          <Calendar className="h-4 w-4" />
          Bokningar
        </Link>

        {/* SETTINGS */}
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
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
          <span className="flex items-center gap-3">
            <Settings2 className="h-4 w-4" />
            Inställningar
          </span>

          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              settingsOpen && "rotate-180"
            )}
          />
        </button>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            settingsOpen
              ? "max-h-80 opacity-100"
              : "max-h-0 opacity-0"
          )}
        >
          <div className="ml-3 mt-2 space-y-1 border-l border-border pl-3">

            <Link
              href={routes.staffSettingsProfile}
              className={linkClass(routes.staffSettingsProfile)}
              onClick={onNavigate}
            >
              <UserCircle2 className="h-4 w-4" />
              Profil
            </Link>

            <Link
              href={routes.staffSettingsHours}
              className={linkClass(routes.staffSettingsHours)}
              onClick={onNavigate}
            >
              <Clock className="h-4 w-4" />
              Öppettider
            </Link>

            <Link
              href={routes.staffSettingsServices}
              className={linkClass(routes.staffSettingsServices)}
              onClick={onNavigate}
            >
              <Package className="h-4 w-4" />
              Tjänster
            </Link>

          </div>
        </div>
      </nav>

      {/* LOGOUT */}
      <div className="mt-auto pt-6">
        <Button
          variant="outline"
          onClick={logout}
          className="
            w-full
            justify-start
            gap-3
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
          bg-navfoot-bg
          p-6
        "
      >
        {/* HEADER */}
        <div className="border-b border-border/30 pb-5">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Staff Dashboard
          </p>

          <h1 className="mt-2 text-xl font-bold">
            {business.name}
          </h1>
        </div>

        {/* LINKS */}
        <div className="mt-6 flex-1">
          <SidebarLinks />
        </div>
      </aside>

      {/* MOBILE */}
      <div className="md:hidden">

        {/* TOP BAR */}
        <div className="fixed top-0 left-0 z-30 w-full border-b border-border/40 bg-navfoot-bg">
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
            "fixed inset-0 z-40 bg-black/70 transition-opacity duration-300",
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
              bg-navfoot-bg
              border-r
              border-border/40
              p-6
              shadow-xl
              transition-transform
              duration-300
            `,
            open
              ? "translate-x-0"
              : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b border-border/30 pb-4">
            <h1 className="text-lg font-bold">
              {business.name}
            </h1>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-6 flex-1">
            <SidebarLinks onNavigate={() => setOpen(false)} />
          </div>
        </aside>
      </div>
    </>
  )
}