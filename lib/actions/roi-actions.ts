'use server'

import { getROIDefaults, saveROIDefaults, getLiveKPIsForROI, type ROIDefaults } from '@/lib/roi'
import { revalidatePath } from 'next/cache'
import { isDevDemoMode } from '@/lib/runtime'
import { getOrgSettings } from '@/lib/data'

export async function getROIDefaultsAction(): Promise<{
  success: boolean
  defaults?: ROIDefaults
  liveKPIs?: {
    averageDealSize?: number
    winRate?: number
    averageSalesCycleDays?: number
    averageARDays?: number
  }
  error?: string
}> {
  try {
    let defaults: ROIDefaults = {}
    let liveKPIs = {}

    if (isDevDemoMode()) {
      const settings = await getOrgSettings()
      defaults = (settings.roi_defaults as ROIDefaults) || {}
      const { getOpportunities } = await import('@/lib/data')
      const opps = await getOpportunities()

      const wonOpps = opps.filter((o: any) => o.stage === 'WON')
      const allClosedOpps = opps.filter((o: any) => ['WON', 'LOST'].includes(o.stage))
      if (wonOpps.length > 0) {
        liveKPIs = {
          averageDealSize: Math.round(
            wonOpps.reduce((sum: number, o: any) => sum + (o.amount || 0), 0) / wonOpps.length
          ),
          winRate:
            allClosedOpps.length > 0
              ? Math.round((wonOpps.length / allClosedOpps.length) * 1000) / 10
              : undefined,
        }
      }
    } else {
      defaults = await getROIDefaults()
      liveKPIs = await getLiveKPIsForROI()
    }

    return {
      success: true,
      defaults,
      liveKPIs,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to load ROI defaults',
    }
  }
}

export async function saveROIDefaultsAction(defaults: ROIDefaults): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const result = await saveROIDefaults(defaults)
    if (result.success) {
      revalidatePath('/app/roi')
      revalidatePath('/app')
    }
    return result
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to save ROI defaults',
    }
  }
}

