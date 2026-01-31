import { listAccounts, listOpportunities, listTasks, listQuotes } from '@/lib/actions/crm-actions'
import { CommandCenterView } from './command-center-view'
import { getOrgContext } from '@/lib/org-context'

export default async function AppPage() {
  const context = await getOrgContext()
  const accountsResult = await listAccounts()
  const oppsResult = await listOpportunities()
  const tasksResult = await listTasks()
  const quotesResult = await listQuotes()

  const accounts = accountsResult.accounts || []
  const opportunities = oppsResult.opportunities || []
  const tasks = tasksResult.tasks || []
  const quotes = quotesResult.quotes || []

  // Get recent records (latest 5 each)
  const recentAccounts = accounts.slice(0, 5)
  const recentOpportunities = opportunities.slice(0, 5)
  const recentQuotes = quotes.slice(0, 5)
  
  // Get open tasks (due in next 7 days)
  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const openTasks = tasks
    .filter(t => ['OPEN', 'IN_PROGRESS'].includes(t.status))
    .filter(t => {
      if (!t.due_date) return false
      const due = new Date(t.due_date)
      return due >= now && due <= nextWeek
    })
    .slice(0, 5)

  // Check if this is a new/empty org (no records)
  const isEmpty = accounts.length === 0 && opportunities.length === 0 && tasks.length === 0 && quotes.length === 0

  return (
    <CommandCenterView
      recentAccounts={recentAccounts}
      recentOpportunities={recentOpportunities}
      recentTasks={openTasks}
      recentQuotes={recentQuotes}
      totalAccounts={accounts.length}
      totalOpportunities={opportunities.length}
      openTasksCount={tasks.filter(t => ['OPEN', 'IN_PROGRESS'].includes(t.status)).length}
      totalQuotes={quotes.length}
      isDemo={context?.isDemo || false}
      isEmpty={isEmpty}
    />
  )
}
