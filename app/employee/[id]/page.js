'use client'

import EmployeeProfile from '@/page-components/EmployeeProfile.js'

export default function EmployeeProfilePage({ params }) {
  return <EmployeeProfile id={params.id} />
}
