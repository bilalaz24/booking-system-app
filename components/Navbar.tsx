import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button, buttonVariants } from './ui/button'
import { getBusiness } from '@/lib/queries/business'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Menu } from 'lucide-react'

const Navbar = async () => {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const {business} = await getBusiness(supabase)

  return (
    <nav className='w-full py-8 px-24 border-b-gray-300 border-b-[1px] flex items-center justify-between'>
      <div>
        <Link href="/">
          {/*}<Image src="/logo.png" alt={business.name} height="100" width="150" />{*/}
          <h1 className='text-2xl'>{business.name}</h1>
        </Link>
      </div>
      <div className='md:hidden'>
        <Menu />
      </div>
      <ul className='hidden md:flex items-center gap-8 text-gray-300'>
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
      <div className='hidden md:block'>
        <Link className={buttonVariants()} href="/book">Booka Nu</Link>
      </div>
    </nav>
  )
}

export default Navbar