import { switchOrganization } from '@/lib/actions/org-actions'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { orgId } = await request.json()
    if (!orgId) {
      return NextResponse.json({ error: 'orgId required' }, { status: 400 })
    }

    // Use the switchOrganization action which includes validation
    const result = await switchOrganization(orgId)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set org' }, { status: 500 })
  }
}
