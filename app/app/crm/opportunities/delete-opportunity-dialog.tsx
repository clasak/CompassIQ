'use client'

import { useState } from 'react'
import { deleteOpportunity } from '@/lib/actions/crm-actions'
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
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { isDemoOrgError } from '@/lib/errors'

interface DeleteOpportunityDialogProps {
  children: React.ReactNode
  opportunityId: string
}

export function DeleteOpportunityDialog({
  children,
  opportunityId,
}: DeleteOpportunityDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)

    try {
      const result = await deleteOpportunity(opportunityId)

      if (result.error) {
        if (isDemoOrgError({ message: result.error })) {
          toast.error('Demo organization is read-only')
        } else {
          toast.error(result.error)
        }
        return
      }

      toast.success('Opportunity deleted successfully')
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete opportunity')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Opportunity</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this opportunity? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}




