"use client";

import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useBusiness } from "../providers/BusinessProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/button";
import { routes } from "@/lib/routes";

export default function SideBar() {
    const supabase = createClient()
    const business = useBusiness()
    const router = useRouter()

    const logout = async () => {
        await supabase.auth.signOut()
        router.push(routes.home)
    }

    return (
        <aside className="fixed z-100 left-0 top-0 h-screen w-64 bg-navfoot-bg text-foreground p-6">
            <div>
                {/*<Image src="/logo.png" alt={business.name} height="50" width="100" />*/}
                <h1 className="text-xl font-bold mb-6">{business.name}</h1>
            </div>

            <nav className="space-y-3">
                <Link className="block hover:bg-gray-800 p-2" href={routes.staffOverview}>
                Översikt
                </Link>
                <Link className="block hover:bg-gray-800 p-2" href={routes.staffSettings}>
                Inställningar
                </Link>
                <Button className="block text-center" onClick={logout}>
                Logga ut
                </Button>
            </nav>
        </aside>
    );
}