import { getOrgContext } from '@/lib/org-context'
import { redirect } from 'next/navigation'
import { ScreenshotPack } from './screenshot-pack'

export default async function ScreenshotPackPage() {
  const context = await getOrgContext()
  if (!context) redirect('/app')
  if (!context.isAdmin) redirect('/app')

  return <ScreenshotPack />
}

