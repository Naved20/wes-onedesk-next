'use client'

import EmployeeProfile from '@/pages/EmployeeProfile.js'

export const dynamic = 'force-dynamic'

export default function EmployeeProfilePage({ params }) {
  return <EmployeeProfile id={params.id} />
}
