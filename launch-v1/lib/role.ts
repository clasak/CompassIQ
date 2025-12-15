import type { Role } from './database.types'

export const ROLE_HIERARCHY: Record<Role, number> = {
  OWNER: 100,
  ADMIN: 80,
  SALES: 60,
  OPS: 60,
  FINANCE: 60,
  VIEWER: 10,
}

export function canManageUsers(role: Role): boolean {
  return role === 'OWNER' || role === 'ADMIN'
}

export function canEditBranding(role: Role): boolean {
  return role === 'OWNER' || role === 'ADMIN'
}

export function canWriteSales(role: Role): boolean {
  return ['OWNER', 'ADMIN', 'SALES'].includes(role)
}

export function canWriteOps(role: Role): boolean {
  return ['OWNER', 'ADMIN', 'OPS'].includes(role)
}

export function canWriteFinance(role: Role): boolean {
  return ['OWNER', 'ADMIN', 'FINANCE'].includes(role)
}

export function canDelete(role: Role): boolean {
  return role === 'OWNER' || role === 'ADMIN'
}

export function canAssignRole(currentRole: Role, targetRole: Role): boolean {
  if (currentRole === 'OWNER') return true
  if (currentRole === 'ADMIN') return targetRole !== 'OWNER'
  return false
}

export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    OWNER: 'Owner',
    ADMIN: 'Admin',
    SALES: 'Sales',
    OPS: 'Operations',
    FINANCE: 'Finance',
    VIEWER: 'Viewer',
  }
  return labels[role]
}

export function getRoleBadgeColor(role: Role): string {
  const colors: Record<Role, string> = {
    OWNER: 'bg-purple-100 text-purple-800',
    ADMIN: 'bg-blue-100 text-blue-800',
    SALES: 'bg-green-100 text-green-800',
    OPS: 'bg-orange-100 text-orange-800',
    FINANCE: 'bg-yellow-100 text-yellow-800',
    VIEWER: 'bg-gray-100 text-gray-800',
  }
  return colors[role]
}
