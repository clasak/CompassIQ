'use client'

import { useEffect, useState } from 'react'
import { getCurrentUserRole } from '@/lib/actions/org-actions'

export interface RoleState {
  role: string | null
  isDemo: boolean
  isAdmin: boolean
  canWrite: boolean
  canWriteSales: boolean
  canWriteOps: boolean
  canWriteFinance: boolean
  canWriteAdmin: boolean
  loading: boolean
}

export function useRole() {
  const [roleState, setRoleState] = useState<RoleState>({
    role: null,
    isDemo: false,
    isAdmin: false,
    canWrite: false,
    canWriteSales: false,
    canWriteOps: false,
    canWriteFinance: false,
    canWriteAdmin: false,
    loading: true,
  })

  useEffect(() => {
    loadRole()
  }, [])

  async function loadRole() {
    const result = await getCurrentUserRole()
    if (result.error) {
      setRoleState((prev) => ({ ...prev, loading: false }))
      return
    }

    const role = result.role || null
    const isDemo = result.isDemo

    // Calculate permissions
    const isAdmin = ['OWNER', 'ADMIN'].includes(role || '')
    const canWriteSalesRole = ['OWNER', 'ADMIN', 'SALES'].includes(role || '')
    const canWriteOpsRole = ['OWNER', 'ADMIN', 'OPS'].includes(role || '')
    const canWriteFinanceRole = ['OWNER', 'ADMIN', 'FINANCE'].includes(role || '')
    const canWriteAdmin = !isDemo && isAdmin
    const canWriteSales = !isDemo && canWriteSalesRole
    const canWriteOps = !isDemo && canWriteOpsRole
    const canWriteFinance = !isDemo && canWriteFinanceRole
    const canWrite = canWriteAdmin || canWriteSales || canWriteOps || canWriteFinance

    setRoleState({
      role,
      isDemo,
      canWrite,
      isAdmin,
      canWriteSales,
      canWriteOps,
      canWriteFinance,
      canWriteAdmin,
      loading: false,
    })
  }

  return {
    ...roleState,
    refresh: loadRole,
  }
}

