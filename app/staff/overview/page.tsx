import React from 'react'
import Bookings from '@/components/staff/Bookings'
import { getBusiness } from '@/lib/queries/business'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { routes } from '@/lib/routes'

const OverviewPage = async () => {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const {data: {user: authUser}} = await supabase.auth.getUser()

  if (!authUser) {
    redirect(routes.login)
  }

  const {data: user, error} = await supabase.from("business_users").select("*").eq("auth_user_id", authUser.id).single()

  if (error) {
    console.error("Error fetching user in staff overview", error)
  }

  return (
    <div>
      <h1 className='mb-6 mt-6 md:mt-0 text-3xl'>Hej, <span className='text-muted-foreground' style={{ fontFamily: "inherit" }}>{user.name}</span></h1>  
      <Bookings page="overview" />
    </div>
  )
}

export default OverviewPage