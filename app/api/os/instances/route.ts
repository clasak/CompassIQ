import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrgContext, requireOrgContext } from '@/lib/org-context'
import { getServerUser } from '@/lib/supabase/server'

export async function GET() {
  try {
    const context = await getOrgContext()
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('os_instances')
      .select('*, os_templates(name, key, description)')
      .eq('org_id', context.orgId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching instances:', error)
      return NextResponse.json({ error: 'Failed to fetch instances' }, { status: 500 })
    }

    return NextResponse.json({ instances: data || [] })
  } catch (error: any) {
    console.error('Error in GET /api/os/instances:', error)
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
    const { templateKey, name } = body

    if (!templateKey) {
      return NextResponse.json({ error: 'templateKey is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const user = await getServerUser()

    // Get template
    const { data: template, error: templateError } = await supabase
      .from('os_templates')
      .select('*')
      .eq('key', templateKey)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Create instance
    const instanceName = name || `${template.name} - ${new Date().toLocaleDateString()}`
    const { data: instance, error: instanceError } = await supabase
      .from('os_instances')
      .insert({
        org_id: context.orgId,
        template_id: template.id,
        name: instanceName,
        status: 'draft',
        created_by: user?.email || 'unknown'
      })
      .select()
      .single()

    if (instanceError) {
      console.error('Error creating instance:', instanceError)
      return NextResponse.json({ error: 'Failed to create instance' }, { status: 500 })
    }

    return NextResponse.json({ instance })
  } catch (error: any) {
    console.error('Error in POST /api/os/instances:', error)
    if (error.message === 'No organization context') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


