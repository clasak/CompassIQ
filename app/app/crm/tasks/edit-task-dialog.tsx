'use client'

import { useState, useEffect } from 'react'
import { updateTask, Task, Account, Opportunity } from '@/lib/actions/crm-actions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { isDemoOrgError } from '@/lib/errors'

interface EditTaskDialogProps {
  children: React.ReactNode
  task: Task
  accounts: Account[]
  opportunities: Opportunity[]
}

export function EditTaskDialog({ children, task, accounts, opportunities }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: task.title,
    status: task.status,
    priority: task.priority,
    due_date: task.due_date || '',
    account_id: task.related_type === 'account' ? task.related_id || '' : '',
    opportunity_id: task.related_type === 'opportunity' ? task.related_id || '' : '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await updateTask(task.id, {
        title: formData.title,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date || undefined,
        account_id: formData.account_id || undefined,
        opportunity_id: formData.opportunity_id || undefined,
      })

      if (result.error) {
        if (isDemoOrgError({ message: result.error })) {
          toast.error('Demo organization is read-only')
        } else {
          toast.error(result.error)
        }
        return
      }

      toast.success('Task updated successfully')
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Update task information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account_id">Account (optional)</Label>
            <Select
              value={formData.account_id}
              onValueChange={(value) => {
                setFormData({ ...formData, account_id: value, opportunity_id: '' })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="opportunity_id">Opportunity (optional)</Label>
            <Select
              value={formData.opportunity_id}
              onValueChange={(value) => setFormData({ ...formData, opportunity_id: value })}
              disabled={!!formData.account_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an opportunity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {opportunities
                  .filter((opp) => !formData.account_id || opp.account_id === formData.account_id)
                  .map((opp) => (
                    <SelectItem key={opp.id} value={opp.id}>
                      {opp.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {formData.account_id && (
              <p className="text-xs text-muted-foreground">
                Opportunities will be filtered by the selected account
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
