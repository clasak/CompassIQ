'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createQuote, Opportunity } from '@/lib/actions/crm-actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { isDemoOrgError } from '@/lib/errors'
import { ActionButton } from '@/components/ui/action-button'

interface CreateQuoteFromOpportunityDialogProps {
  opportunity: Opportunity
  children: React.ReactNode
}

export function CreateQuoteFromOpportunityDialog({
  opportunity,
  children,
}: CreateQuoteFromOpportunityDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [quoteName, setQuoteName] = useState(`Quote for ${opportunity.name}`)
  const [creating, setCreating] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)

    try {
      const result = await createQuote({
        account_id: opportunity.account_id,
        opportunity_id: opportunity.id,
        name: quoteName,
        status: 'draft',
      })

      if (result.error) {
        if (isDemoOrgError({ message: result.error })) {
          toast.error('Demo organization is read-only')
        } else {
          toast.error(result.error)
        }
        return
      }

      toast.success('Quote created successfully')
      setOpen(false)
      // Navigate to the quote builder
      router.push(`/app/crm/quotes/${result.quote?.id}/quote-builder`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create quote')
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Quote from Opportunity</DialogTitle>
          <DialogDescription>
            Create a new quote for opportunity: {opportunity.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quoteName">Quote Name</Label>
            <Input
              id="quoteName"
              value={quoteName}
              onChange={(e) => setQuoteName(e.target.value)}
              placeholder="Enter quote name"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <ActionButton actionType="admin" type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create Quote'}
            </ActionButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
