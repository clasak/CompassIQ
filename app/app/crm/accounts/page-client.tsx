'use client'

import { useSearchParams } from 'next/navigation'
import { CreateAccountDialog } from './create-account-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function AccountsPageClient() {
  const searchParams = useSearchParams()
  const shouldOpenDialog = searchParams.get('create') === 'true'

  if (!shouldOpenDialog) return null

  return (
    <CreateAccountDialog>
      <Button variant="default" className="hidden">
        <Plus className="h-4 w-4" />
        New Account
      </Button>
    </CreateAccountDialog>
  )
}


