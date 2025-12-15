import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('compass-preview-id')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error exiting preview:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
