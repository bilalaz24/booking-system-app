/*import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button, buttonVariants } from './ui/button'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Menu } from 'lucide-react'
import { routes } from '@/lib/routes'
import { getCurrentBusiness } from '@/lib/business/getCurrentBusiness'

const Navbar = async () => {
  const {business} = await getCurrentBusiness()

  return (
    <nav className='w-full sticky top-0 z-50 py-8 px-24 bg-navfoot-bg border-b-muted border-b-4 flex items-center justify-between'>
      <div>
        <Link href={routes.home}>
          <Image src="/logof.png" alt={business.name} height="50" width="100" />
          <h1 className='text-2xl'>{business?.name || "business name not shown"}</h1>
        </Link>
      </div>
      <div className='md:hidden'>
        <Menu />
      </div>
      <ul className='hidden md:flex items-center gap-8 text-gray-300'>
        <li>
          <Link className='hover:text-accent' href={routes.home}>Hem</Link>
        </li>
        <li>
          <Link className='hover:text-accent' href={routes.services}>Tjänster</Link>
        </li>
        <li>
          <Link className='hover:text-accent' href={routes.about}>Om oss</Link>
        </li>
        <li>
          <Link className='hover:text-accent' href={routes.contact}>Kontakta</Link>
        </li>
      </ul>
      <div className='hidden md:block'>
        <Link className={buttonVariants()} href={routes.booking}>Booka Nu</Link>
      </div>
    </nav>
  )
}

export default Navbar*/
"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { buttonVariants } from "./ui/button"
import { routes } from "@/lib/routes"
import { useBusiness } from "./providers/BusinessProvider"

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const { business } = useBusiness()

  const menuRef = useRef<HTMLDivElement>(null)

  const businessName = business?.name || "Business"

  // Close when clicking outside
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClick)
    }

    return () => {
      document.removeEventListener("mousedown", handleClick)
    }
  }, [open])

  // Lock scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""

    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <>
      <nav
        className="
          sticky
          top-0
          z-50
          w-full
          border-b
          border-border/40
          bg-navfoot-bg/90
          backdrop-blur-xl
        "
      >
        <div className="mx-auto flex h-20 items-center justify-between px-5 md:px-12">

          {/* Logo */}
          <Link
            href={routes.home}
            className="
              text-xl
              font-bold
              tracking-tight
              transition-colors
              hover:text-accent
            "
          >
            {businessName}
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-10">
            {[
              ["Hem", routes.home],
              ["Tjänster", routes.services],
              ["Om oss", routes.about],
              ["Kontakta", routes.contact],
            ].map(([label, href]) => (
              <li key={label}>
                <Link
                  href={href}
                  className="
                    relative
                    text-sm
                    font-medium
                    text-muted-foreground
                    transition-all
                    duration-200
                    hover:text-foreground
                    after:absolute
                    after:left-0
                    after:-bottom-1
                    after:h-[2px]
                    after:w-0
                    after:bg-accent
                    after:transition-all
                    after:duration-300
                    hover:after:w-full
                  "
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Link
              href={routes.booking}
              className={buttonVariants({
                className:
                  "transition-transform duration-200 hover:scale-105"
              })}
            >
              Boka nu
            </Link>
          </div>

          {/* Mobile button */}
          <button
            onClick={() => setOpen(!open)}
            className="
              md:hidden
              rounded-xl
              p-2
              transition-all
              duration-200
              hover:bg-muted/50
            "
            aria-label="Menu"
          >
            <div
              className={`
                transition-transform
                duration-300
                ${open ? "rotate-90" : ""}
              `}
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </div>
          </button>
        </div>
      </nav>

      {/* Dark backdrop */}
      <div
        className={`
          fixed inset-0 z-40 bg-black/70 backdrop-blur-sm
          transition-opacity duration-300
          md:hidden
          ${open ? "opacity-100" : "pointer-events-none opacity-0"}
        `}
      />

      {/* Mobile menu */}
      <div
        className={`
          fixed
          left-4
          right-4
          top-24
          z-50
          md:hidden
          transition-all
          duration-300
          ease-out

          ${
            open
              ? "translate-y-0 opacity-100"
              : "-translate-y-4 pointer-events-none opacity-0"
          }
        `}
      >
        <div
          ref={menuRef}
          className="
            overflow-hidden
            rounded-3xl
            border
            border-border/50
            bg-card
            shadow-2xl
          "
        >
          <div className="p-3">

            <div className="mb-3 border-b border-border/30 pb-3">
              <p className="text-lg font-semibold">
                {businessName}
              </p>
            </div>

            <div className="flex flex-col gap-1">

              <Link
                href={routes.home}
                onClick={() => setOpen(false)}
                className="
                  rounded-2xl
                  px-4
                  py-4
                  transition-all
                  duration-200
                  hover:bg-muted/50
                  hover:translate-x-1
                "
              >
                Hem
              </Link>

              <Link
                href={routes.services}
                onClick={() => setOpen(false)}
                className="
                  rounded-2xl
                  px-4
                  py-4
                  transition-all
                  duration-200
                  hover:bg-muted/50
                  hover:translate-x-1
                "
              >
                Tjänster
              </Link>

              <Link
                href={routes.about}
                onClick={() => setOpen(false)}
                className="
                  rounded-2xl
                  px-4
                  py-4
                  transition-all
                  duration-200
                  hover:bg-muted/50
                  hover:translate-x-1
                "
              >
                Om oss
              </Link>

              <Link
                href={routes.contact}
                onClick={() => setOpen(false)}
                className="
                  rounded-2xl
                  px-4
                  py-4
                  transition-all
                  duration-200
                  hover:bg-muted/50
                  hover:translate-x-1
                "
              >
                Kontakta
              </Link>

              <div className="mt-3">
                <Link
                  href={routes.booking}
                  onClick={() => setOpen(false)}
                  className={buttonVariants({
                    className:
                      "w-full h-12 text-base"
                  })}
                >
                  Boka nu
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar