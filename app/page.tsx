import Image from "next/image";
import { getBusiness } from "@/lib/queries/business";
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export default async function Home() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const data = await getBusiness(supabase)
  const config = data.business_config

  return (
    <div>
      <h1>{config.hero_title}</h1>
      <p>this is a test for the font</p>
    </div>
  );
}
