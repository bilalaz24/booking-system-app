import Image from "next/image";
import {getCurrentBusiness} from "@/lib/business/getCurrentBusiness";
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export default async function Home() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const data = await getCurrentBusiness()
  const config = data.settings

  return (
    <div>
      <h1>{config?.hero_title}</h1>
      <p>{config?.hero_description}</p>
    </div>
  );
}
