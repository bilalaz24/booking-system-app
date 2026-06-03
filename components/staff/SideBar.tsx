"use client";

import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useBusiness } from "../providers/BusinessProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/button";
import { routes } from "@/lib/routes";
import { MenuIcon, MenuSquareIcon, XIcon } from "lucide-react";
import { useState } from "react";

export default function SideBar() {
    const supabase = createClient()
    const business = useBusiness()
    const router = useRouter()

    const [open, setOpen] = useState(false)

    const logout = async () => {
        await supabase.auth.signOut()
        router.push(routes.home)
    }

    return (
        <>
            <aside
                className="hidden md:block fixed top-0 left-0 z-50 h-screen w-64 bg-navfoot-bg p-6">
                <div>
                    {/*<Image src="/logo.png" alt={business.name} height="50" width="100" />*/}
                    <h1 className="text-xl font-bold mb-6">{business.name}</h1>
                </div>
                <nav className="space-y-3">
                    <Link className="block hover:bg-gray-800 p-2" href={routes.staffOverview}> Översikt </Link>
                    <Link className="block hover:bg-gray-800 p-2" href={routes.staffBookings}> Bookningar </Link>
                    <Link className="block hover:bg-gray-800 p-2" href={routes.staffSettings}> Inställningar </Link>
                    <Button className="block text-center" onClick={logout}> Logga ut </Button>
                </nav>
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
                    {/*<Image src="/logo.png" alt={business.name} height="50" width="100" />*/}
                    <h1 className="text-xl font-bold mb-6">{business.name}</h1>
                    <Button onClick={() => setOpen(!open)} className="">
                        <XIcon />
                    </Button>
                </div>
                <nav className="space-y-3">
                    <Link className="block hover:bg-gray-800 p-2" href={routes.staffOverview}> Översikt </Link>
                    <Link className="block hover:bg-gray-800 p-2" href={routes.staffBookings}> Bookningar </Link>
                    <Link className="block hover:bg-gray-800 p-2" href={routes.staffSettings}> Inställningar </Link>
                    <Button className="block text-center" onClick={logout}> Logga ut </Button>
                </nav>
            </aside>

            {!open && (
                <div className="bg-navfoot-bg w-full fixed top-0 left-0 md:hidden">
                    <div className="relative h-16">
                        <Button className="absolute top-1/2 -translate-y-1/2 left-3" onClick={() => setOpen(true)}>
                            <MenuIcon />
                        </Button>
                        <div className="text-center absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2">
                            <h1 className="items-center">{business.name}</h1>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
}