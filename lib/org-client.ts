'use client'

const ORG_COOKIE_NAME = 'compass-org-id'

export function getOrgIdClient(): string | null {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie.split(';')
  const orgCookie = cookies.find((c) => c.trim().startsWith(`${ORG_COOKIE_NAME}=`))
  if (orgCookie) {
    return orgCookie.split('=')[1]
  }
  return null
}

export async function setOrgIdClient(orgId: string) {
  // Call API route to set cookie (HTTP-only cookie must be set server-side)
  try {
    const response = await fetch('/api/org/set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId }),
      credentials: 'include',
    })
    return response.ok
  } catch (error) {
    console.error('Failed to set org:', error)
    return false
  }
}

