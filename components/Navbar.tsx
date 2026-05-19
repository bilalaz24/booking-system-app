import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button, buttonVariants } from './ui/button'
import { getBusiness } from '@/lib/queries/business'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const Navbar = async () => {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {business} = await getBusiness(supabase)

  return (
    <nav className='w-full px-24 border-b-gray-300 border-b-[1px] flex items-center justify-between'>
      <div>
        <Image src="/logo.png" alt='logo' width="120" height="120" />
      </div>
      <ul className='flex items-center gap-8 text-gray-300'>
        <li>
          <Link className='hover:text-yellow-500' href="/">Hem</Link>
        </li>
        <li>
          <Link className='hover:text-yellow-500' href="/about">Om oss</Link>
        </li>
        <li>
          <Link className='hover:text-yellow-500' href="/contact">Kontakta</Link>
        </li>
      </ul>
      <div>
        <Link className={buttonVariants()} href="/book">Booka Nu</Link>
      </div>
    </nav>
  )
}

export default Navbar