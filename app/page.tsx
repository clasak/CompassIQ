import { redirect } from 'next/navigation'

export default async function RootPage() {
  // Always redirect to login - let middleware handle auth checks
  // This prevents 500 errors when env vars are missing
  redirect('/login')
}

