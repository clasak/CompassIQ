import { Sidebar } from '@/components/layout/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        {/* pt-16 on mobile to clear hamburger menu, normal padding on desktop */}
        <div className="pt-16 px-4 pb-4 sm:px-6 sm:pb-6 lg:pt-8 lg:px-8 lg:pb-8">{children}</div>
      </main>
    </div>
  )
}
