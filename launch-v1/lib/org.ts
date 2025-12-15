import { cookies } from 'next/headers'

const ORG_COOKIE = 'compass-org-id'
const PREVIEW_COOKIE = 'compass-preview-id'

export async function getCurrentOrgId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(ORG_COOKIE)?.value || null
}

export async function setCurrentOrgId(orgId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(ORG_COOKIE, orgId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export async function getPreviewId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(PREVIEW_COOKIE)?.value || null
}

export async function setPreviewId(previewId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(PREVIEW_COOKIE, previewId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  })
}

export async function clearPreviewId(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(PREVIEW_COOKIE)
}

export function isDemoOrg(orgId: string): boolean {
  return orgId === process.env.DEMO_ORG_ID || orgId === '00000000-0000-0000-0000-000000000001'
}
