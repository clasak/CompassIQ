import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireOrgContext } from '@/lib/org-context'

export async function PATCH(
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

    const alertId = params.id
    const body = await request.json()
    const { owner, due_at, disposition, state } = body

    const supabase = await createClient()

    // Verify alert belongs to org
    const { data: existing, error: checkError } = await supabase
      .from('alerts')
      .select('id, resolved_at')
      .eq('id', alertId)
      .eq('org_id', context.orgId)
      .single()

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    // Build update object
    const updates: any = {}
    if (owner !== undefined) updates.owner = owner
    if (due_at !== undefined) updates.due_at = due_at
    if (disposition !== undefined) updates.disposition = disposition
    if (state !== undefined) {
      updates.state = state
      if (state === 'resolved') {
        updates.resolved_at = new Date().toISOString()
      } else if (state !== 'resolved' && existing.resolved_at) {
        updates.resolved_at = null
      }
    }

    const { data, error } = await supabase
      .from('alerts')
      .update(updates)
      .eq('id', alertId)
      .select()
      .single()

    if (error) {
      console.error('Error updating alert:', error)
      return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
    }

    return NextResponse.json({ alert: data })
  } catch (error: any) {
    console.error('Error in PATCH /api/os/alerts/[id]:', error)
    if (error.message === 'No organization context') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



