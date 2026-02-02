import { NextRequest, NextResponse } from 'next/server'
import { campaignsApi, activitiesApi } from '@/lib/supabase-tables'
import { isSupabaseConfigured } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }
  
  try {
    const { campaignId, leadIds } = await request.json()
    
    if (!campaignId || !leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: 'campaignId and leadIds array required' },
        { status: 400 }
      )
    }
    
    // Start the campaign with selected leads
    await campaignsApi.startCampaign(campaignId, leadIds)
    
    // Log activity
    await activitiesApi.create({
      type: 'status_change',
      campaign_id: campaignId,
      description: `Campaign started with ${leadIds.length} leads enrolled`,
      metadata: { leadIds, action: 'campaign_started' }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: `Campaign started with ${leadIds.length} leads`,
      leadsEnrolled: leadIds.length
    })
  } catch (error) {
    console.error('Error starting campaign:', error)
    return NextResponse.json({ error: 'Failed to start campaign' }, { status: 500 })
  }
}
