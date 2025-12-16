import { cookies } from 'next/headers'

const PREVIEW_COOKIE_NAME = 'preview-workspace-id'

/**
 * Get active preview workspace ID from cookie (server-side)
 */
export async function getActivePreviewId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(PREVIEW_COOKIE_NAME)?.value || null
}

/**
 * Set active preview workspace ID in cookie (server-side)
 */
export async function setActivePreviewId(previewId: string) {
  const cookieStore = await cookies()
  cookieStore.set(PREVIEW_COOKIE_NAME, previewId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/app',
  })
}

/**
 * Clear active preview workspace ID cookie (server-side)
 */
export async function clearActivePreviewId() {
  const cookieStore = await cookies()
  cookieStore.delete(PREVIEW_COOKIE_NAME)
}


