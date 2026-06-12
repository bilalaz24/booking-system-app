import OpeningHours from '@/components/staff/OpeningHours'
import Profile from '@/components/staff/Profile'
import React from 'react'

const staffSettings = () => {
  return (
    <div>
      <h2>Hemsida</h2>
      <section>
        <h3>Profil</h3>
        <Profile />
      </section>
      <section>
        <h3>Öppettider</h3>
        <OpeningHours />
      </section>
    </div>
  )
}

export default staffSettings