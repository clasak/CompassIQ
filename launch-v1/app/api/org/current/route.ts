import { NextResponse } from 'next/server'
import { getCurrentOrgId } from '@/lib/org'

export async function GET() {
  const orgId = await getCurrentOrgId()
  return NextResponse.json({ orgId })
}
