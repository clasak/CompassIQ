import { listAccounts } from '@/lib/actions/crm-actions'
import { AccountsTable } from './accounts-table'
import { ActionButton } from '@/components/ui/action-button'
import { Plus } from 'lucide-react'
import { CreateAccountDialog } from './create-account-dialog'

export default async function AccountsPage() {
  const result = await listAccounts()
  const accounts = result.accounts || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">Manage your customer accounts</p>
        </div>
        <CreateAccountDialog>
          <ActionButton actionType="admin">
            <Plus className="h-4 w-4 mr-2" />
            New Account
          </ActionButton>
        </CreateAccountDialog>
      </div>

      <AccountsTable accounts={accounts} />
    </div>
  )
}

