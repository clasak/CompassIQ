'use client'

import { useState } from 'react'
import { createInvite, revokeInvite, type InviteInfo } from '@/lib/actions/settings-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ActionButton } from '@/components/ui/action-button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Copy, Trash2, CheckCircle2, XCircle, Clock } from 'lucide-react'

interface InvitesManagementProps {
  initialInvites: InviteInfo[]
  isDemo: boolean
  canAssignOwner: boolean
}

const ROLES = [
  { value: 'VIEWER', label: 'Viewer' },
  { value: 'SALES', label: 'Sales' },
  { value: 'OPS', label: 'Ops' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'OWNER', label: 'Owner' },
] as const

export function InvitesManagement({ initialInvites, isDemo, canAssignOwner }: InvitesManagementProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('VIEWER')
  const [isCreating, setIsCreating] = useState(false)
  const [invites, setInvites] = useState<InviteInfo[]>(initialInvites)
  const [revoking, setRevoking] = useState<string | null>(null)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  async function handleCreateInvite(e: React.FormEvent) {
    e.preventDefault()
    if (isDemo) {
      toast.error('Demo organization cannot create invitations')
      return
    }

    if (!email.trim()) {
      toast.error('Email is required')
      return
    }

    setIsCreating(true)
    try {
      const result = await createInvite(email.trim(), role)
      if (result.success && result.token) {
        const newInvite: InviteInfo = {
          id: result.inviteId || '',
          email: email.trim(),
          role,
          token: result.token,
          created_at: new Date().toISOString(),
          accepted_at: null,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: null,
        }
        setInvites([newInvite, ...invites])
        setEmail('')
        setRole('VIEWER')
        toast.success('Invitation created successfully')
      } else {
        toast.error(result.error || 'Failed to create invitation')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsCreating(false)
    }
  }

  async function handleRevoke(inviteId: string) {
    if (!confirm('Are you sure you want to revoke this invitation?')) {
      return
    }

    setRevoking(inviteId)
    try {
      const result = await revokeInvite(inviteId)
      if (result.success) {
        setInvites(invites.filter((inv) => inv.id !== inviteId))
        toast.success('Invitation revoked')
      } else {
        toast.error(result.error || 'Failed to revoke invitation')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setRevoking(null)
    }
  }

  function copyInviteLink(token: string) {
    const link = `${baseUrl}/invite/${token}`
    navigator.clipboard.writeText(link)
    toast.success('Invitation link copied to clipboard')
  }

  function getInviteStatus(invite: InviteInfo): 'pending' | 'accepted' | 'expired' {
    if (invite.accepted_at) {
      return 'accepted'
    }
    if (new Date(invite.expires_at) < new Date()) {
      return 'expired'
    }
    return 'pending'
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreateInvite} className="space-y-4 border-b pb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              disabled={isCreating || isDemo}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole} disabled={isCreating || isDemo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => {
                  if (r.value === 'OWNER' && !canAssignOwner) {
                    return null
                  }
                  return (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ActionButton
          type="submit"
          actionType="admin"
          disabled={isCreating || !email.trim() || isDemo}
          demoMessage="Demo organization cannot create invitations"
        >
          {isCreating ? 'Creating...' : 'Create Invitation'}
        </ActionButton>
      </form>

      <div>
        <h3 className="text-lg font-semibold mb-4">Existing Invitations</h3>
        {invites.length === 0 ? (
          <p className="text-muted-foreground text-sm">No invitations yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invites.map((invite) => {
                const status = getInviteStatus(invite)
                const isRevoking = revoking === invite.id

                return (
                  <TableRow key={invite.id}>
                    <TableCell>{invite.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{invite.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {status === 'accepted' && (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Accepted
                        </Badge>
                      )}
                      {status === 'expired' && (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Expired
                        </Badge>
                      )}
                      {status === 'pending' && (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(invite.expires_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {status === 'pending' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => copyInviteLink(invite.token)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Link
                            </Button>
                            <ActionButton
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRevoke(invite.id)}
                              disabled={isRevoking || isDemo}
                              actionType="admin"
                              demoMessage="Demo organization cannot modify invitations"
                            >
                              {isRevoking ? (
                                'Revoking...'
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Revoke
                                </>
                              )}
                            </ActionButton>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
