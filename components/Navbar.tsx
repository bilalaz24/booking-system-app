import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button, buttonVariants } from './ui/button'
import { getBusiness } from '@/lib/queries/business'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Menu } from 'lucide-react'
import { routes } from '@/lib/routes'

const Navbar = async () => {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {business} = await getBusiness(supabase)

  return (
    <nav className='w-full sticky top-0 z-50 py-8 px-24 bg-navfoot-bg border-b-muted border-b-4 flex items-center justify-between'>
      <div>
        <Link href={routes.home}>
          {/*<Image src="/logof.png" alt={business.name} height="50" width="100" />*/}
          <h1 className='text-2xl'>{business.name}</h1>
        </Link>
      </div>
      <div className='md:hidden'>
        <Menu />
      </div>
      <ul className='hidden md:flex items-center gap-8 text-gray-300'>
        <li>
          <Link className='hover:text-barber-blue' href={routes.home}>Hem</Link>
        </li>
        <li>
          <Link className='hover:text-barber-blue' href={routes.services}>Tjänster</Link>
        </li>
        <li>
          <Link className='hover:text-barber-blue' href={routes.about}>Om oss</Link>
        </li>
        <li>
          <Link className='hover:text-barber-blue' href={routes.contact}>Kontakta</Link>
        </li>
      </ul>
      <div className='hidden md:block'>
        <Link className={buttonVariants()} href={routes.booking}>Booka Nu</Link>
      </div>
    </nav>
  )
}

export default Navbar