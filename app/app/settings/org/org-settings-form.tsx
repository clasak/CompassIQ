'use client'

import { useState } from 'react'
import { updateOrgName } from '@/lib/actions/settings-actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { ActionButton } from '@/components/ui/action-button'

interface OrgSettingsFormProps {
  initialName: string
  slug: string
  isDemo: boolean
}

export function OrgSettingsForm({ initialName, slug, isDemo }: OrgSettingsFormProps) {
  const [name, setName] = useState(initialName)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isDemo) {
      toast.error('Demo organization cannot be modified')
      return
    }

    if (!name.trim()) {
      toast.error('Organization name is required')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await updateOrgName(name.trim())
      if (result.success) {
        toast.success('Organization name updated successfully')
      } else {
        toast.error(result.error || 'Failed to update organization name')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Organization Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isDemo || isSubmitting}
          placeholder="Enter organization name"
        />
      </div>
      <ActionButton
        type="submit"
        actionType="admin"
        disabled={isSubmitting || name === initialName}
        demoMessage="Demo organization cannot be modified"
      >
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </ActionButton>
    </form>
  )
}
