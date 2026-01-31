'use client'

import { useState } from 'react'
import { updateMemberRole, removeMember, type MemberInfo } from '@/lib/actions/settings-actions'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ActionButton } from '@/components/ui/action-button'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface UsersManagementTableProps {
  members: MemberInfo[]
  currentUserRole: string
  isDemo: boolean
}

const ROLES = [
  { value: 'VIEWER', label: 'Viewer' },
  { value: 'SALES', label: 'Sales' },
  { value: 'OPS', label: 'Ops' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'OWNER', label: 'Owner' },
] as const

export function UsersManagementTable({ members, currentUserRole, isDemo }: UsersManagementTableProps) {
  const [updating, setUpdating] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)

  const isOwner = currentUserRole === 'OWNER'
  const canAssignOwner = isOwner

  async function handleRoleChange(userId: string, newRole: string) {
    setUpdating(userId)
    try {
      const result = await updateMemberRole(userId, newRole)
      if (result.success) {
        toast.success('Member role updated successfully')
        window.location.reload()
      } else {
        toast.error(result.error || 'Failed to update role')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setUpdating(null)
    }
  }

  async function handleRemove(userId: string) {
    if (!confirm('Are you sure you want to remove this member from the organization?')) {
      return
    }

    setRemoving(userId)
    try {
      const result = await removeMember(userId)
      if (result.success) {
        toast.success('Member removed successfully')
        window.location.reload()
      } else {
        toast.error(result.error || 'Failed to remove member')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setRemoving(null)
    }
  }

  if (members.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No members found</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User ID</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => {
          const isUpdating = updating === member.user_id
          const isRemoving = removing === member.user_id
          const canChangeRole = !isDemo && (canAssignOwner || member.role !== 'OWNER')
          const canRemove =
            !isDemo &&
            (member.role !== 'OWNER' || (isOwner && members.filter((m) => m.role === 'OWNER').length > 1))

          return (
            <TableRow key={member.user_id}>
              <TableCell className="font-mono text-xs">{member.user_id.slice(0, 8)}...</TableCell>
              <TableCell>
                {member.email || <span className="text-muted-foreground italic">Not available</span>}
              </TableCell>
              <TableCell>
                {canChangeRole ? (
                  <Select
                    value={member.role}
                    onValueChange={(value) => handleRoleChange(member.user_id, value)}
                    disabled={isUpdating || isDemo}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => {
                        if (role.value === 'OWNER' && !canAssignOwner) {
                          return null
                        }
                        return (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline">{member.role}</Badge>
                )}
              </TableCell>
              <TableCell>{new Date(member.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <ActionButton
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(member.user_id)}
                  disabled={!canRemove || isRemoving || isUpdating}
                  actionType="admin"
                  demoMessage="Demo organization cannot be modified"
                >
                  {isRemoving ? (
                    'Removing...'
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </>
                  )}
                </ActionButton>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
