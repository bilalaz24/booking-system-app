"use client"

import { useStaffUser } from '../providers/StaffUserProvider'

import React from 'react'

const Overview = () => {
    const user = useStaffUser()

  return (
    <div>
        <h1>Hello {user.name} </h1>
    </div>
  )
}

export default Overview