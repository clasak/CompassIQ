import { NextRequest, NextResponse } from 'next/server'
import { getActivePreviewId } from '@/lib/preview'

export async function GET(request: NextRequest) {
  try {
    const previewId = await getActivePreviewId()
    return NextResponse.json({ previewId })
  } catch (error: any) {
    return NextResponse.json({ previewId: null })
  }
}




