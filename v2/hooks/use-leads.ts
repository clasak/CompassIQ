'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Lead } from '@/lib/supabase'

interface LeadStats {
  total: number
  byStatus: Record<string, number>
  byIndustry: Record<string, number>
  totalValue: number
  avgValue: number
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<LeadStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/leads')
      if (!res.ok) throw new Error('Failed to fetch leads')
      const data = await res.json()
      setLeads(data.leads)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/leads/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [])

  const createLead = useCallback(async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    })
    if (!res.ok) throw new Error('Failed to create lead')
    const data = await res.json()
    setLeads(prev => [data.lead, ...prev])
    fetchStats()
    return data.lead
  }, [fetchStats])

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    if (!res.ok) throw new Error('Failed to update lead')
    const data = await res.json()
    setLeads(prev => prev.map(l => l.id === id ? data.lead : l))
    fetchStats()
    return data.lead
  }, [fetchStats])

  const deleteLead = useCallback(async (id: string) => {
    const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete lead')
    setLeads(prev => prev.filter(l => l.id !== id))
    fetchStats()
  }, [fetchStats])

  const seedLeads = useCallback(async () => {
    const res = await fetch('/api/leads/seed', { method: 'POST' })
    if (!res.ok) throw new Error('Failed to seed leads')
    const data = await res.json()
    await fetchLeads()
    await fetchStats()
    return data
  }, [fetchLeads, fetchStats])

  useEffect(() => {
    fetchLeads()
    fetchStats()
  }, [fetchLeads, fetchStats])

  return {
    leads,
    stats,
    isLoading,
    error,
    fetchLeads,
    fetchStats,
    createLead,
    updateLead,
    deleteLead,
    seedLeads
  }
}
