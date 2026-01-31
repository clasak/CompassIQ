import { NextResponse } from 'next/server'
import { getOrgContext } from '@/lib/org-context'
import { createClient } from '@/lib/supabase/server'

const DEMO_DEFAULTS = {
  roi_defaults: {
    averageDealSize: 75000,
    monthlyLeads: 50,
    currentWinRate: 25,
    targetWinRate: 35,
    currentSalesCycleDays: 60,
    targetSalesCycleDays: 45,
    reportingHoursPerWeek: 8,
    hourlyCost: 75,
    arDaysReductionTarget: 10,
    churnReductionTarget: 2,
  },
  alert_thresholds: {},
  metadata: {},
}

export async function POST() {
  const context = await getOrgContext()

  // Keep demo reset locked down.
  if (!context || !context.isAdmin || !context.isDemo) {
    return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 })
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('org_settings')
      .upsert(
        {
          org_id: context.orgId,
          ...DEMO_DEFAULTS,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'org_id' }
      )

    if (error) {
      return NextResponse.json({ ok: false, error: 'Failed to reset' }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to reset' }, { status: 500 })
  }
}

