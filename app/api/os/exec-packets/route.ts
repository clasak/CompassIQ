import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireOrgContext } from '@/lib/org-context'

export async function POST(request: Request) {
  try {
    const context = await requireOrgContext()
    
    if (context.isDemo || !context.canWrite) {
      return NextResponse.json(
        { error: 'Demo org is read-only', code: 'DEMO_READ_ONLY' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { os_instance_id, period_start, period_end } = body

    if (!os_instance_id) {
      return NextResponse.json({ error: 'os_instance_id is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify instance belongs to org
    const { data: instance, error: instanceError } = await supabase
      .from('os_instances')
      .select('id, name, template_id, os_templates(template_json)')
      .eq('id', os_instance_id)
      .eq('org_id', context.orgId)
      .single()

    if (instanceError || !instance) {
      return NextResponse.json({ error: 'OS instance not found' }, { status: 404 })
    }

    // Calculate period (default to weekly if not provided)
    const end = period_end ? new Date(period_end) : new Date()
    const start = period_start ? new Date(period_start) : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Get top alerts
    const { data: topAlerts } = await supabase
      .from('alerts')
      .select('*')
      .eq('org_id', context.orgId)
      .eq('os_instance_id', os_instance_id)
      .in('state', ['open', 'acknowledged', 'in_progress'])
      .order('severity', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10)

    // Get commitments (tasks due in period)
    const { data: commitments } = await supabase
      .from('os_tasks')
      .select('*')
      .eq('org_id', context.orgId)
      .in('state', ['open', 'in_progress'])
      .gte('due_at', start.toISOString())
      .lte('due_at', end.toISOString())

    // Build packet JSON
    const templateJson = (instance.os_templates as any)?.template_json
    const kpiKeys = templateJson?.kpis?.map((k: any) => k.key) || []

    const packetJson = {
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      os_instance: {
        id: instance.id,
        name: instance.name
      },
      kpis: kpiKeys.map((key: string) => ({
        key,
        // Placeholder - would need actual KPI values
        value: null,
        trend: null
      })),
      top_alerts: topAlerts || [],
      commitments: commitments || [],
      generated_at: new Date().toISOString()
    }

    // Save packet
    const { data: packet, error: packetError } = await supabase
      .from('exec_packets')
      .insert({
        org_id: context.orgId,
        os_instance_id,
        period_start: start.toISOString(),
        period_end: end.toISOString(),
        packet_json: packetJson
      })
      .select()
      .single()

    if (packetError) {
      console.error('Error creating exec packet:', packetError)
      return NextResponse.json({ error: 'Failed to create exec packet' }, { status: 500 })
    }

    return NextResponse.json({ packet, packet_json: packetJson })
  } catch (error: any) {
    console.error('Error in POST /api/os/exec-packets:', error)
    if (error.message === 'No organization context') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


