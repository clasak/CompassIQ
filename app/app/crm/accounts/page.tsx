import { listAccounts } from '@/lib/actions/crm-actions'
import { AccountsTable } from './accounts-table'
import { ActionButton } from '@/components/ui/action-button'
import { Plus } from 'lucide-react'
import { CreateAccountDialog } from './create-account-dialog'
import { PageHeader } from '@/components/ui/page-header'
import { AccountsPageClient } from './page-client'

export default async function AccountsPage() {
  const result = await listAccounts()
  const accounts = result.accounts || []

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Accounts"
        description="Manage your customer accounts and company information"
        action={
          <CreateAccountDialog>
            <ActionButton actionType="admin" className="gap-2">
              <Plus className="h-4 w-4" />
              New Account
            </ActionButton>
          </CreateAccountDialog>
        }
      />

      <AccountsTable accounts={accounts} />
      <AccountsPageClient />
    </div>
  )
}


