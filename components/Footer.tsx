import Link from 'next/link'
import { routes } from '@/lib/routes'
import React from 'react'

const Footer = () => {
  return (
    <div className='bg-navfoot-bg border-t-4 border-t-muted h-40'>
        <h1>FOOTER</h1>
        <Link href={routes.staffOverview}>Staff</Link>
    </div>
  )
}

export default Footer