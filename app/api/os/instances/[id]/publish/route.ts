import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireOrgContext } from '@/lib/org-context'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const context = await requireOrgContext()
    
    if (context.isDemo || !context.canWrite) {
      return NextResponse.json(
        { error: 'Demo org is read-only', code: 'DEMO_READ_ONLY' },
        { status: 403 }
      )
    }

    const instanceId = params.id
    const supabase = await createClient()

    // Get instance with template
    const { data: instance, error: instanceError } = await supabase
      .from('os_instances')
      .select('*, os_templates(template_json)')
      .eq('id', instanceId)
      .eq('org_id', context.orgId)
      .single()

    if (instanceError || !instance) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 })
    }

    if (instance.status === 'published') {
      // Idempotent: return success if already published
      return NextResponse.json({ success: true, instanceId, message: 'Instance already published' })
    }

    const templateJson = (instance.os_templates as any)?.template_json
    if (!templateJson) {
      return NextResponse.json({ error: 'Template data not found' }, { status: 500 })
    }

    // Update instance status
    const { error: updateError } = await supabase
      .from('os_instances')
      .update({
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', instanceId)

    if (updateError) {
      console.error('Error updating instance:', updateError)
      return NextResponse.json({ error: 'Failed to publish instance' }, { status: 500 })
    }

    // Create cadence items from template (idempotent: delete existing first)
    if (templateJson.cadence && Array.isArray(templateJson.cadence)) {
      // Delete existing cadence items for this instance
      await supabase
        .from('cadence_items')
        .delete()
        .eq('org_id', context.orgId)
        .eq('os_instance_id', instanceId)

      const cadenceInserts = templateJson.cadence.map((cad: any) => ({
        org_id: context.orgId,
        os_instance_id: instanceId,
        cadence: cad.cadence,
        title: cad.title,
        rules_json: cad.rules
      }))

      const { error: cadenceError } = await supabase
        .from('cadence_items')
        .insert(cadenceInserts)

      if (cadenceError) {
        console.error('Error creating cadence items:', cadenceError)
        // Continue even if cadence creation fails
      }
    }

    // Create default alerts from template (idempotent: only if none exist)
    if (templateJson.alerts && Array.isArray(templateJson.alerts)) {
      // Check if alerts already exist
      const { data: existingAlerts } = await supabase
        .from('alerts')
        .select('id')
        .eq('org_id', context.orgId)
        .eq('os_instance_id', instanceId)
        .limit(1)

      // Only create if no alerts exist (idempotent)
      if (!existingAlerts || existingAlerts.length === 0) {
        const alertInserts = templateJson.alerts.map((alert: any) => ({
          org_id: context.orgId,
          os_instance_id: instanceId,
          kpi_key: alert.kpi_key,
          severity: alert.severity,
          type: alert.type,
          title: alert.title,
          description: alert.description,
          state: 'open',
          owner: null,
          due_at: null
        }))

        const { error: alertsError } = await supabase
          .from('alerts')
          .insert(alertInserts)

        if (alertsError) {
          console.error('Error creating alerts:', alertsError)
          // Continue even if alerts creation fails
        }
      }
    }

    return NextResponse.json({ success: true, instanceId })
  } catch (error: any) {
    console.error('Error in POST /api/os/instances/[id]/publish:', error)
    if (error.message === 'No organization context') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

