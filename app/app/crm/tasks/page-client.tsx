'use client'

import { useSearchParams } from 'next/navigation'

export function TasksPageClient() {
  const searchParams = useSearchParams()
  const shouldOpenDialog = searchParams.get('create') === 'true'

  // Dialog is handled by parent page component
  return null
}
