import type { Metadata } from "next";
import { Oswald, Arimo } from "next/font/google"; // 1. Swapped out Geist for Oswald & Arimo
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"
import { Toaster } from "sonner";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { BusinessProvider } from "@/components/providers/BusinessProvider";
import { getCurrentBusiness } from "@/lib/business/getCurrentBusiness";

// 2. Configure the aggressive heading font
const oswald = Oswald({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "700"], // Heavy weights for that serious look
});

// 3. Configure the ultra-clean body font
const arimo = Arimo({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Booking App",
  description: "Razor-sharp style and technical grooming engineered to perfection.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
/*
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID

  const { data: business, error } = await supabase.from("businesses").select("*").eq("id", businessId).single()

  const { data: business_config, error: business_config_error } = await supabase
  .from("business_settings")
  .select("*")
  .eq("business_id", businessId)
  .single()

  if (error) throw business_config_error
  if (business_config_error) throw business_config_error

  const businessData = {
    business,
    settings: business_config
  }*/

  const businessData = await getCurrentBusiness()
  console.log("Business data in RootLayout:", businessData)

  if (businessData.success === false || !businessData.business || !businessData.settings) {
    return (
      <html lang="en" className={`${oswald.variable} ${arimo.variable} h-full bg-[#050608]`}>
        <body className="flex items-center justify-center h-full text-white font-body">
          <div className="text-center p-6 border border-[#161a22] bg-[#11141a]">
            <h1 className="text-xl font-bold text-[#E60026] uppercase font-heading tracking-wider">Configuration Error</h1>
            <p className="text-sm text-[#A3A8B3] mt-2">Could not load business data.</p>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html
      lang="en"
      /* 4. Injected the new font variables into the root HTML class list */
      className={`${oswald.variable} ${arimo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-body">
        <BusinessProvider value={{business: businessData.business, settings: businessData.settings}}>
          {/*<main>className="max-w-7xl flex-1 mx-auto w-full px-2 py-8 md:px-6 lg:px-8"*/}
            {children}
          {/*</main>*/}
          <Toaster closeButton />
        </BusinessProvider>
      </body>
    </html>
  );
}