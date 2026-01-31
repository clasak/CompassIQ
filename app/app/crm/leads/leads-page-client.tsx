'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CreateLeadDialog } from './create-lead-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function LeadsPageClient() {
  const searchParams = useSearchParams()
  const shouldOpenDialog = searchParams.get('create') === 'true'

  if (!shouldOpenDialog) return null

  return (
    <CreateLeadDialog>
      <Button variant="default" className="hidden">
        <Plus className="h-4 w-4" />
        New Lead
      </Button>
    </CreateLeadDialog>
  )
}
