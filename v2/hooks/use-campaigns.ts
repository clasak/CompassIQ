'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Campaign } from '@/lib/supabase-tables'

interface CampaignStats {
  totalCampaigns: number
  activeCampaigns: number
  totalLeadsEnrolled: number
  totalEmailsSent: number
  totalOpens: number
  totalReplies: number
  totalMeetings: number
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCampaigns = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/campaigns')
      if (!res.ok) throw new Error('Failed to fetch campaigns')
      const data = await res.json()
      setCampaigns(data.campaigns || [])
      
      // Calculate stats
      const c = data.campaigns || []
      setStats({
        totalCampaigns: c.length,
        activeCampaigns: c.filter((x: Campaign) => x.status === 'active').length,
        totalLeadsEnrolled: c.reduce((sum: number, x: Campaign) => sum + (x.leads_enrolled || 0), 0),
        totalEmailsSent: c.reduce((sum: number, x: Campaign) => sum + (x.emails_sent || 0), 0),
        totalOpens: c.reduce((sum: number, x: Campaign) => sum + (x.opens || 0), 0),
        totalReplies: c.reduce((sum: number, x: Campaign) => sum + (x.replies || 0), 0),
        totalMeetings: c.reduce((sum: number, x: Campaign) => sum + (x.meetings_booked || 0), 0)
      })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const startCampaign = useCallback(async (campaignId: string, leadIds: string[]) => {
    const res = await fetch('/api/campaigns/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId, leadIds })
    })
    if (!res.ok) throw new Error('Failed to start campaign')
    const data = await res.json()
    await fetchCampaigns()
    return data
  }, [fetchCampaigns])

  const createCampaign = useCallback(async (campaign: Partial<Campaign>) => {
    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaign)
    })
    if (!res.ok) throw new Error('Failed to create campaign')
    const data = await res.json()
    setCampaigns(prev => [data.campaign, ...prev])
    return data.campaign
  }, [])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  return {
    campaigns,
    stats,
    isLoading,
    error,
    fetchCampaigns,
    startCampaign,
    createCampaign
  }
}
