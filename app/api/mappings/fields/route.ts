import { NextResponse } from 'next/server'
import { getOrgContext } from '@/lib/org-context'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const connectionId = String(searchParams.get('connection') || '').trim()

  try {
    const context = await getOrgContext()
    if (!context) return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 })
    if (!context.isAdmin) {
      return NextResponse.json({ ok: false, error: 'OWNER/ADMIN required' }, { status: 403 })
    }
    if (!connectionId) return NextResponse.json({ ok: false, error: 'Missing connection' }, { status: 400 })

    const supabase = await createClient()

    const { data: raw } = await supabase
      .from('raw_events')
      .select('payload')
      .eq('org_id', context.orgId)
      .eq('source_connection_id', connectionId)
      .order('received_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const dataObj = (raw as any)?.payload?.data
    const keys =
      dataObj && typeof dataObj === 'object' && !Array.isArray(dataObj) ? Object.keys(dataObj).sort() : []

    return NextResponse.json({ ok: true, fields: keys })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Failed' }, { status: 500 })
  }
}

