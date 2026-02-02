import { NextResponse } from 'next/server'
import { leadsApi, isSupabaseConfigured } from '@/lib/supabase'
import { prospects } from '@/lib/leads-data'

// POST /api/leads/seed - Import existing prospects into Supabase
export async function POST() {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: 'Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.' },
      { status: 503 }
    )
  }
  
  try {
    // Transform prospects to match database schema
    const leadsToInsert = prospects.map(p => ({
      company: p.company,
      industry: p.industry,
      size: p.size,
      location: p.location,
      pain_points: p.painPoints,
      status: p.status,
      estimated_value: p.estimatedValue,
      priority: p.priority,
      notes: p.notes,
      emails_sent: p.emailsSent || 0,
      responses: p.responses || 0,
      next_action: p.nextAction,
      last_contact: p.lastContact
    }))

    const leads = await leadsApi.bulkInsert(leadsToInsert)
    
    return NextResponse.json({ 
      success: true, 
      imported: leads.length,
      message: `Successfully imported ${leads.length} leads into Supabase`
    })
  } catch (error) {
    console.error('Error seeding leads:', error)
    return NextResponse.json(
      { error: 'Failed to seed leads', details: String(error) },
      { status: 500 }
    )
  }
}
