"use client";

import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useBusiness } from "../providers/BusinessProvider";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/button";
import { routes } from "@/lib/routes";
import { Calendar, ChevronDown, Clock, Home, MenuIcon, MenuSquareIcon, Package, Settings2, UserCircle2, XIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

function Links({ onNavigate }: { onNavigate?: () => void }) {
    const supabase = createClient()
    const router = useRouter()
    const pathname = usePathname()
    const [dropdown, setDropdown] = useState(false)

    const logout = async () => {
        await supabase.auth.signOut()
        router.push(routes.home)
    }

    const linkClass = (href: string) =>
        cn(
            "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === href
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted"
        )

    return (
        /*<nav className="space-y-3">
            <Link className="block hover:bg-gray-800 p-2" href={routes.staffOverview}> Översikt </Link>
            <Link className="block hover:bg-gray-800 p-2" href={routes.staffBookings}> Bookningar </Link>
            <Button className="flex items-center bg-transparent hover:bg-gray-800 p-2" onClick={() => setDropdown(!dropdown)}> Inställningar <ChevronDown className="ml-2 w-4" /> </Button>
            {dropdown && (
                <div>
                    <Link className="block hover:bg-gray-800 p-2 ml-4" href={routes.staffSettingsProfile}> Profil </Link>
                    <Link className="block hover:bg-gray-800 p-2 ml-4" href={routes.staffSettingsHours}> Öppettider </Link>
                    <Link className="block hover:bg-gray-800 p-2 ml-4" href={routes.staffSettingsServices}> Tjänster </Link>
                </div>
            )}
            <Button className="block text-center" onClick={logout}> Logga ut </Button>
        </nav>*/
        <nav className="space-y-1">
            <Link
                className={linkClass(routes.staffOverview)}
                //className="flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                href={routes.staffOverview}
                onClick={onNavigate}
            >
                <Home className="w-4 mr-2" />
                Översikt
            </Link>

            <Link
                className={linkClass(routes.staffBookings)}
                //className="flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                href={routes.staffBookings}
                onClick={onNavigate}
            >
                <Calendar className="w-4 mr-2" />
                Bokningar
            </Link>

            <button
                onClick={() => {
                    setDropdown(!dropdown)
                    onNavigate
                }}
                className="flex w-full bg-transparent items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >

                <span className="flex"><Settings2 className="w-4 mr-2" />Inställningar</span>

                <ChevronDown
                className={`h-4 w-4 transition-transform ${
                    dropdown ? "rotate-180" : ""
                }`}
                />
            </button>

            {dropdown && (
                <div className="ml-4 border-l pl-3 space-y-1">
                <Link
                    className={linkClass(routes.staffSettingsProfile)}
                    //className="flex items-center rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    href={routes.staffSettingsProfile}
                    onClick={onNavigate}
                >
                    <UserCircle2 className="w-4 mr-2" />
                    Profil
                </Link>

                <Link
                    className={linkClass(routes.staffSettingsHours)}
                    //className="flex items-center rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    href={routes.staffSettingsHours}
                    onClick={onNavigate}
                >
                    <Clock className="w-4 mr-2" />
                    Öppettider
                </Link>

                <Link
                    className={linkClass(routes.staffSettingsServices)}
                    //className="flex items-center rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    href={routes.staffSettingsServices}
                    onClick={onNavigate}
                >
                    <Package className="w-4 mr-2" />
                    Tjänster
                </Link>
                </div>
            )}

            <div className="pt-4">
                <Button
                variant="outline"
                className="w-full"
                onClick={logout}
                >
                Logga ut
                </Button>
            </div>

            </nav>
    )
}

export default function SideBar() {
    //const supabase = createClient()
    const business = useBusiness()
    //const router = useRouter()

    const [open, setOpen] = useState(false)

    /*const logout = async () => {
        await supabase.auth.signOut()
        router.push(routes.home)
    }*/

    return (
        <>
            <aside
                className="hidden md:block fixed top-0 left-0 z-50 h-screen w-64 bg-navfoot-bg p-6">
                <div>
                    {/*<Image src="/logo.png" alt={business.name} height="50" width="100" />*/}
                    <h1 className="text-xl font-bold mb-6">{business.business.name}</h1>
                </div>
                <Links onNavigate={() => setOpen(false)} />
            </aside>
        <div className="md:hidden">
            <div
                onClick={() => setOpen(false)}
                className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
                open ? "opacity-50" : "opacity-0 pointer-events-none"
                }`}
            />

            <aside
                className={`z-50 fixed top-0 left-0 z-50 h-screen w-64 bg-navfoot-bg p-6
                transform transition-transform duration-300 ease-out
                ${open ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex justify-between">
                    {/*<Image src="/logo.png" alt={business.business.name} height="50" width="100" />*/}
                    <h1 className="text-xl font-bold mb-6">{business.business.name}</h1>
                    <Button onClick={() => setOpen(!open)} className="">
                        <XIcon />
                    </Button>
                </div>
                <Links onNavigate={() => setOpen(false)} />
            </aside>

            {!open && (
                <div className="bg-navfoot-bg z-50 w-full fixed top-0 left-0 md:hidden">
                    <div className="relative h-16">
                        <Button className="absolute top-1/2 -translate-y-1/2 left-3" onClick={() => setOpen(true)}>
                            <MenuIcon />
                        </Button>
                        <div className="text-center absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2">
                            <h1 className="items-center">{business.business.name}</h1>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
}