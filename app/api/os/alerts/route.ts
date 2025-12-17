import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrgContext, requireOrgContext } from '@/lib/org-context'

export async function GET(request: Request) {
  try {
    const context = await getOrgContext()
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state')
    const severity = searchParams.get('severity')
    const kpiKey = searchParams.get('kpi_key')
    const osInstanceId = searchParams.get('os_instance_id')

    const supabase = await createClient()
    let query = supabase
      .from('alerts')
      .select('*, os_instances(name, status)')
      .eq('org_id', context.orgId)
      .order('created_at', { ascending: false })

    if (state) {
      query = query.eq('state', state)
    }
    if (severity) {
      query = query.eq('severity', severity)
    }
    if (kpiKey) {
      query = query.eq('kpi_key', kpiKey)
    }
    if (osInstanceId) {
      query = query.eq('os_instance_id', osInstanceId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching alerts:', error)
      return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
    }

    return NextResponse.json({ alerts: data || [] })
  } catch (error: any) {
    console.error('Error in GET /api/os/alerts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}




