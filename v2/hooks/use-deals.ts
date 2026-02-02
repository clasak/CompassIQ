'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Deal } from '@/lib/supabase-tables'

interface PipelineStats {
  total: number
  weighted: number
  count: number
  byStage: {
    stage: string
    count: number
    value: number
  }[]
}

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [pipeline, setPipeline] = useState<PipelineStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDeals = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/deals')
      if (!res.ok) throw new Error('Failed to fetch deals')
      const data = await res.json()
      setDeals(data.deals || [])
      
      // Calculate pipeline stats
      const d = data.deals || []
      const stages = ['discovery', 'qualification', 'proposal', 'negotiation', 'closed-won']
      setPipeline({
        total: d.reduce((sum: number, x: Deal) => sum + (x.value || 0), 0),
        weighted: d.reduce((sum: number, x: Deal) => sum + ((x.value || 0) * (x.probability || 0) / 100), 0),
        count: d.length,
        byStage: stages.map(stage => ({
          stage,
          count: d.filter((x: Deal) => x.stage === stage).length,
          value: d.filter((x: Deal) => x.stage === stage).reduce((sum: number, x: Deal) => sum + (x.value || 0), 0)
        }))
      })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createDeal = useCallback(async (deal: Partial<Deal>) => {
    const res = await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deal)
    })
    if (!res.ok) throw new Error('Failed to create deal')
    const data = await res.json()
    setDeals(prev => [data.deal, ...prev])
    return data.deal
  }, [])

  useEffect(() => {
    fetchDeals()
  }, [fetchDeals])

  return {
    deals,
    pipeline,
    isLoading,
    error,
    fetchDeals,
    createDeal
  }
}
