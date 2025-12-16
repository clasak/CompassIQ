import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrgContext } from '@/lib/org-context'

export async function GET() {
  try {
    const context = await getOrgContext()
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('os_templates')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching templates:', error)
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }

    return NextResponse.json({ templates: data || [] })
  } catch (error: any) {
    console.error('Error in GET /api/os/templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


