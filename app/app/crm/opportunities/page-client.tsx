'use client'

import { useSearchParams } from 'next/navigation'
import { CreateOpportunityDialog } from './create-opportunity-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { listAccounts, listOpportunities } from '@/lib/actions/crm-actions'
import { useEffect, useState } from 'react'

export function OpportunitiesPageClient() {
  const searchParams = useSearchParams()
  const shouldOpenDialog = searchParams.get('create') === 'true'
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (shouldOpenDialog) {
      // Data will be loaded by parent page, but we can also fetch here if needed
      setLoading(false)
    }
  }, [shouldOpenDialog])

  if (!shouldOpenDialog) return null

  // Parent page will handle the dialog with proper data loading
  return null
}
