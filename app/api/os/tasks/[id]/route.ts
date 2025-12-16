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

    const taskId = params.id
    const body = await request.json()
    const { state, proof } = body

    const supabase = await createClient()

    // Verify task belongs to org
    const { data: existing, error: checkError } = await supabase
      .from('os_tasks')
      .select('id, state, completed_at')
      .eq('id', taskId)
      .eq('org_id', context.orgId)
      .single()

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Build update object
    const updates: any = {}
    if (state !== undefined) {
      updates.state = state
      if (state === 'done') {
        updates.completed_at = new Date().toISOString()
      } else if (state !== 'done' && existing.completed_at) {
        updates.completed_at = null
      }
    }
    if (proof !== undefined) {
      updates.proof = proof
    }

    const { data, error } = await supabase
      .from('os_tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single()

    if (error) {
      console.error('Error updating task:', error)
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }

    return NextResponse.json({ task: data })
  } catch (error: any) {
    console.error('Error in PATCH /api/os/tasks/[id]:', error)
    if (error.message === 'No organization context') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

