'use client'

import EmployeeProfile from '@/pages/EmployeeProfile.js'

export default function EmployeeProfilePage({ params }) {
  return <EmployeeProfile id={params.id} />
}
