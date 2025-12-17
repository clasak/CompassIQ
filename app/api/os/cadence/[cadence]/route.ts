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

    // Collect all IDs and rules upfront to avoid N+1 queries
    const osInstanceIds = (cadenceItems || [])
      .map(item => (item.os_instances as any)?.id)
      .filter(Boolean)

    // Collect all unique severities and task states from all items
    const allSeverities = new Set<string>()
    const allTaskStates = new Set<string>()
    let maxDueWithinDays = 0

    for (const item of cadenceItems || []) {
      const rules = item.rules_json
      if (rules.include_alerts?.severity) {
        rules.include_alerts.severity.forEach((s: string) => allSeverities.add(s))
      }
      if (rules.include_tasks) {
        const taskStates = rules.include_tasks.state || ['open', 'in_progress']
        taskStates.forEach((s: string) => allTaskStates.add(s))
        if (rules.include_tasks.due_within_days) {
          maxDueWithinDays = Math.max(maxDueWithinDays, rules.include_tasks.due_within_days)
        }
      }
    }

    // Single batch query for all alerts
    let allAlerts: any[] = []
    if (allSeverities.size > 0 && osInstanceIds.length > 0) {
      const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .eq('org_id', context.orgId)
        .in('os_instance_id', osInstanceIds)
        .in('severity', Array.from(allSeverities))
        .in('state', ['open', 'acknowledged', 'in_progress'])
      
      allAlerts = alerts || []
    }

    // Single batch query for all tasks
    let allTasks: any[] = []
    if (allTaskStates.size > 0) {
      let taskQuery = supabase
        .from('os_tasks')
        .select('*')
        .eq('org_id', context.orgId)
        .in('state', Array.from(allTaskStates))

      if (maxDueWithinDays > 0) {
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + maxDueWithinDays)
        taskQuery = taskQuery.lte('due_at', dueDate.toISOString())
      }

      const { data: tasks } = await taskQuery
      allTasks = tasks || []
    }

    // Group results in memory by instance_id
    const alertsByInstance = new Map<string, any[]>()
    allAlerts.forEach(alert => {
      const instanceId = alert.os_instance_id
      if (!alertsByInstance.has(instanceId)) {
        alertsByInstance.set(instanceId, [])
      }
      alertsByInstance.get(instanceId)!.push(alert)
    })

    // Process each cadence item with pre-fetched data
    for (const item of cadenceItems || []) {
      const rules = item.rules_json
      const osInstanceId = (item.os_instances as any)?.id

      // Get alerts from pre-fetched data
      if (rules.include_alerts) {
        const alertSeverities = rules.include_alerts.severity || []
        const instanceAlerts = alertsByInstance.get(osInstanceId) || []
        const filteredAlerts = instanceAlerts.filter(a => 
          alertSeverities.includes(a.severity)
        )

        if (filteredAlerts.length > 0) {
          agenda.push({
            type: 'alerts',
            title: `Open ${alertSeverities.join('/')} Alerts`,
            items: filteredAlerts
          })
        }
      }

      // Get tasks from pre-fetched data
      if (rules.include_tasks) {
        const taskStates = rules.include_tasks.state || ['open', 'in_progress']
        const dueWithinDays = rules.include_tasks.due_within_days
        
        let filteredTasks = allTasks.filter(t => taskStates.includes(t.state))
        
        if (dueWithinDays) {
          const dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + dueWithinDays)
          filteredTasks = filteredTasks.filter(t => 
            !t.due_at || new Date(t.due_at) <= dueDate
          )
        }

        if (filteredTasks.length > 0) {
          agenda.push({
            type: 'tasks',
            title: `Tasks (${taskStates.join('/')})`,
            items: filteredTasks
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




