import { NextRequest, NextResponse } from 'next/server'
import { leadsApi, isSupabaseConfigured } from '@/lib/supabase'

// GET /api/leads - Get all leads
export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: 'Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' },
      { status: 503 }
    )
  }
  
  try {
    const leads = await leadsApi.getAll()
    return NextResponse.json({ leads, count: leads.length })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 503 }
    )
  }
  
  try {
    const body = await request.json()
    const lead = await leadsApi.create(body)
    return NextResponse.json({ lead }, { status: 201 })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}
