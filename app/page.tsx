import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BarChart3, Building2, CheckCircle2, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'CompassIQ — Business Operating System',
  description:
    'CompassIQ unifies sales, operations, finance, and execution into one Business Operating System—so you can plan, measure, and deliver with confidence.',
}

export default function RootPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(0,164,169,0.35),transparent)] blur-2xl" />
          <div className="absolute -bottom-48 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(162,238,31,0.22),transparent)] blur-2xl" />
        </div>

        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-3 focus-ring rounded-md">
            <Image
              src="/compass-iq-logo.svg"
              alt="CompassIQ"
              width={32}
              height={32}
              priority
            />
            <Image
              src="/compass-iq-wordmark-light.svg"
              alt="CompassIQ"
              width={140}
              height={24}
              priority
            />
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="#product" className="hover:text-foreground transition-colors">
              Product
            </Link>
            <Link href="#use-cases" className="hover:text-foreground transition-colors">
              Use cases
            </Link>
            <Link href="#security" className="hover:text-foreground transition-colors">
              Security
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/app">
                Open app <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        <main className="relative mx-auto max-w-6xl px-6 pb-16 pt-10">
          <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="border border-border bg-card">
                  Business Operating System
                </Badge>
                <Badge variant="outline" className="text-muted-foreground">
                  Built for multi-tenant teams
                </Badge>
              </div>

              <h1 className="text-hero">
                Make decisions faster.
                <br />
                <span className="text-gradient">Execute with confidence.</span>
              </h1>

              <p className="text-body text-muted-foreground max-w-xl">
                CompassIQ brings sales, operations, finance, and execution into one system—so you
                always know what’s happening, what’s next, and what moves the numbers.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg">
                  <Link href="/login">
                    Get started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/app/demo">View demo</Link>
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
                  Role-aware UI
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
                  KPI-first dashboards
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
                  Guided execution
                </div>
              </div>
            </div>

            <div className="lg:pl-6">
              <div className="rounded-xl border border-border bg-card/60 p-4 shadow-lg backdrop-blur">
                <div className="rounded-lg border border-border bg-background/60 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Weekly Operating Snapshot</div>
                    <div className="text-xs text-muted-foreground">Live</div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Card className="p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BarChart3 className="h-4 w-4 text-[hsl(var(--primary))]" />
                        Revenue
                      </div>
                      <div className="mt-2 text-2xl font-semibold tracking-tight">$412k</div>
                      <div className="mt-1 text-xs text-muted-foreground">+8.4% WoW</div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Zap className="h-4 w-4 text-[hsl(var(--accent))]" />
                        Throughput
                      </div>
                      <div className="mt-2 text-2xl font-semibold tracking-tight">128</div>
                      <div className="mt-1 text-xs text-muted-foreground">tasks closed</div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4 text-[hsl(var(--chart-3))]" />
                        Active work
                      </div>
                      <div className="mt-2 text-2xl font-semibold tracking-tight">17</div>
                      <div className="mt-1 text-xs text-muted-foreground">projects in flight</div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4 text-[hsl(var(--info))]" />
                        Coverage
                      </div>
                      <div className="mt-2 text-2xl font-semibold tracking-tight">98%</div>
                      <div className="mt-1 text-xs text-muted-foreground">data quality</div>
                    </Card>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Connected systems → structured metrics → actionable plans</span>
                  <span className="hidden sm:inline">CompassIQ</span>
                </div>
              </div>
            </div>
          </section>

          <section id="product" className="mt-16">
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <div>
                <div className="text-section">What you get</div>
                <h2 className="mt-2 text-title">A single system for operating the business</h2>
                <p className="mt-2 text-body text-muted-foreground max-w-2xl">
                  CompassIQ is designed around the way teams actually run: plan → execute → review.
                  No more dashboards that don’t connect to action.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/app/operate">Explore operating views</Link>
              </Button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6">
                <div className="text-heading">Operate</div>
                <p className="mt-2 text-body text-muted-foreground">
                  Executive-grade dashboards, KPIs, and trends that stay aligned with real work.
                </p>
              </Card>
              <Card className="p-6">
                <div className="text-heading">Build</div>
                <p className="mt-2 text-body text-muted-foreground">
                  Template and instance workflows to standardize processes across teams and orgs.
                </p>
              </Card>
              <Card className="p-6">
                <div className="text-heading">Execute</div>
                <p className="mt-2 text-body text-muted-foreground">
                  Task-driven execution that connects back to metrics—so progress is measurable.
                </p>
              </Card>
              <Card className="p-6">
                <div className="text-heading">CRM & Sales</div>
                <p className="mt-2 text-body text-muted-foreground">
                  Leads, accounts, opportunities, quotes, and follow-ups in one consistent system.
                </p>
              </Card>
              <Card className="p-6">
                <div className="text-heading">Finance</div>
                <p className="mt-2 text-body text-muted-foreground">
                  Keep the financial picture close to operational reality—no swivel-chair reporting.
                </p>
              </Card>
              <Card className="p-6">
                <div className="text-heading">Multi-tenant by design</div>
                <p className="mt-2 text-body text-muted-foreground">
                  Brandable, org-aware, and built for teams who manage multiple client orgs.
                </p>
              </Card>
            </div>
          </section>

          <section id="use-cases" className="mt-16">
            <div className="text-section">Use cases</div>
            <h2 className="mt-2 text-title">Built for operators</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Card className="p-6">
                <div className="text-heading">Construction & field ops</div>
                <p className="mt-2 text-body text-muted-foreground">
                  Track projects, labor, equipment, changes, AR, and schedules with fewer handoffs.
                </p>
              </Card>
              <Card className="p-6">
                <div className="text-heading">Services & delivery teams</div>
                <p className="mt-2 text-body text-muted-foreground">
                  Turn inbound work into structured workflows and measurable outcomes.
                </p>
              </Card>
            </div>
          </section>

          <section id="security" className="mt-16">
            <div className="text-section">Security</div>
            <h2 className="mt-2 text-title">Designed to be safe by default</h2>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              <Card className="p-6">
                <div className="text-heading">Authentication</div>
                <p className="mt-2 text-body text-muted-foreground">
                  Supabase auth with route protection for the application surface.
                </p>
              </Card>
              <Card className="p-6">
                <div className="text-heading">Org separation</div>
                <p className="mt-2 text-body text-muted-foreground">
                  Multi-tenant routing and org context throughout the app experience.
                </p>
              </Card>
              <Card className="p-6">
                <div className="text-heading">Auditable UI</div>
                <p className="mt-2 text-body text-muted-foreground">
                  Built-in UI click auditing hooks for observability and QA workflows.
                </p>
              </Card>
            </div>
          </section>

          <section className="mt-16">
            <div className="rounded-xl border border-border bg-card/50 p-8 backdrop-blur">
              <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                <div>
                  <div className="text-section">Ready to explore?</div>
                  <h2 className="mt-2 text-title">See CompassIQ in action</h2>
                  <p className="mt-2 text-body text-muted-foreground">
                    Jump into the demo to explore the UI, or sign in to start operating.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button asChild variant="outline" size="lg">
                    <Link href="/app/demo">View demo</Link>
                  </Button>
                  <Button asChild size="lg">
                    <Link href="/login">
                      Sign in <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image src="/compass-iq-logo.svg" alt="CompassIQ" width={24} height={24} />
            <div className="text-sm text-muted-foreground">CompassIQ</div>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link href="/app" className="hover:text-foreground transition-colors">
              Open app
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}




