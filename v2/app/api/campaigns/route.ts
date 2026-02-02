import { NextRequest, NextResponse } from 'next/server'
import { campaignsApi } from '@/lib/supabase-tables'
import { isSupabaseConfigured } from '@/lib/supabase'

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }
  
  try {
    const campaigns = await campaignsApi.getAll()
    return NextResponse.json({ campaigns, count: campaigns.length })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }
  
  try {
    const body = await request.json()
    const campaign = await campaignsApi.create(body)
    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }
}
