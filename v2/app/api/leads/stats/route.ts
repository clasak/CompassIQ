import { NextResponse } from 'next/server'
import { leadsApi, isSupabaseConfigured } from '@/lib/supabase'

// GET /api/leads/stats - Get lead statistics
export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 503 }
    )
  }
  
  try {
    const stats = await leadsApi.getStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching lead stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
