import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrgContext, requireOrgContext } from '@/lib/org-context'
import { getServerUser } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const context = await getOrgContext()
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state')
    const alertId = searchParams.get('alert_id')

    const supabase = await createClient()
    let query = supabase
      .from('os_tasks')
      .select('*, alerts(title, severity)')
      .eq('org_id', context.orgId)
      .order('created_at', { ascending: false })

    if (state) {
      query = query.eq('state', state)
    }
    if (alertId) {
      query = query.eq('alert_id', alertId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    return NextResponse.json({ tasks: data || [] })
  } catch (error: any) {
    console.error('Error in GET /api/os/tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    const { alert_id, title, description, owner, due_at } = body

    if (!title || !owner) {
      return NextResponse.json({ error: 'title and owner are required' }, { status: 400 })
    }

    const supabase = await createClient()
    const user = await getServerUser()

    // If alert_id provided, verify it belongs to org
    if (alert_id) {
      const { data: alert, error: alertError } = await supabase
        .from('alerts')
        .select('id, org_id')
        .eq('id', alert_id)
        .eq('org_id', context.orgId)
        .single()

      if (alertError || !alert) {
        return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
      }
    }

    const { data, error } = await supabase
      .from('os_tasks')
      .insert({
        org_id: context.orgId,
        alert_id: alert_id || null,
        title,
        description: description || null,
        owner,
        state: 'open',
        due_at: due_at || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', error)
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }

    return NextResponse.json({ task: data })
  } catch (error: any) {
    console.error('Error in POST /api/os/tasks:', error)
    if (error.message === 'No organization context') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}




