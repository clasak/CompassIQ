import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Clear preview cookie in response
    const response = NextResponse.json({ ok: true })
    response.cookies.delete('preview-workspace-id')
    response.cookies.set('preview-workspace-id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/app',
    })
    return response
  } catch (error: any) {
    console.error('Preview exit error:', error)
    return NextResponse.json({ error: error.message || 'Failed to exit preview' }, { status: 500 })
  }
}

