import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrgContext } from '@/lib/org-context'

export async function GET(
  request: Request,
  { params }: { params: { cadence: string } }
) {
  try {
    const context = await getOrgContext()
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cadence = params.cadence
    if (!['daily', 'weekly', 'monthly'].includes(cadence)) {
      return NextResponse.json({ error: 'Invalid cadence' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get cadence items for this org
    const { data: cadenceItems, error: cadenceError } = await supabase
      .from('cadence_items')
      .select('*, os_instances(id, name, status)')
      .eq('org_id', context.orgId)
      .eq('cadence', cadence)
      .eq('os_instances.status', 'published')

    if (cadenceError) {
      console.error('Error fetching cadence items:', cadenceError)
      return NextResponse.json({ error: 'Failed to fetch cadence items' }, { status: 500 })
    }

    // Build agenda from rules + live data
    const agenda: any[] = []

    for (const item of cadenceItems || []) {
      const rules = item.rules_json
      const osInstanceId = (item.os_instances as any)?.id

      // Get alerts based on rules
      if (rules.include_alerts) {
        const alertSeverities = rules.include_alerts.severity || []
        const { data: alerts } = await supabase
          .from('alerts')
          .select('*')
          .eq('org_id', context.orgId)
          .eq('os_instance_id', osInstanceId)
          .in('severity', alertSeverities)
          .in('state', ['open', 'acknowledged', 'in_progress'])

        if (alerts && alerts.length > 0) {
          agenda.push({
            type: 'alerts',
            title: `Open ${alertSeverities.join('/')} Alerts`,
            items: alerts
          })
        }
      }

      // Get tasks based on rules
      if (rules.include_tasks) {
        const taskStates = rules.include_tasks.state || ['open', 'in_progress']
        const dueWithinDays = rules.include_tasks.due_within_days
        let taskQuery = supabase
          .from('os_tasks')
          .select('*')
          .eq('org_id', context.orgId)
          .in('state', taskStates)

        if (dueWithinDays) {
          const dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + dueWithinDays)
          taskQuery = taskQuery.lte('due_at', dueDate.toISOString())
        }

        const { data: tasks } = await taskQuery

        if (tasks && tasks.length > 0) {
          agenda.push({
            type: 'tasks',
            title: `Tasks (${taskStates.join('/')})`,
            items: tasks
          })
        }
      }

      // Get KPIs with negative trend (placeholder - would need actual trend calculation)
      if (rules.include_kpis) {
        // This would require actual KPI trend calculation
        // For now, return placeholder
        agenda.push({
          type: 'kpis',
          title: 'KPIs Requiring Attention',
          items: [] // Would be populated with actual KPI trend data
        })
      }
    }

    return NextResponse.json({ cadence, agenda })
  } catch (error: any) {
    console.error('Error in GET /api/os/cadence/[cadence]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


