import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getCurrentOrgId } from '@/lib/org'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, Plus, Calendar, FolderKanban } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function ReviewsPage() {
  const supabase = await createServerSupabaseClient()
  const orgId = await getCurrentOrgId()

  if (!orgId) {
    return <div>No organization selected</div>
  }

  const { data: reviews } = await supabase
    .from('weekly_review_packs')
    .select('*, delivery_projects(name, companies(name))')
    .eq('org_id', orgId)
    .order('week_of', { ascending: false }) as { data: any[] | null }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Weekly Review Packs</h1>
          <p className="text-muted-foreground">
            Generate and manage weekly executive review packages.
          </p>
        </div>
      </div>

      {reviews && reviews.length > 0 ? (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Link key={review.id} href={`/app/delivery/reviews/${review.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ClipboardList className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          Week of {formatDate(review.week_of)}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <FolderKanban className="h-3 w-3" />
                          {(review.delivery_projects as any)?.name || 'No project'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        {(review.action_items as any[])?.length || 0} actions
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No review packs yet</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Weekly review packs are generated from active delivery projects to
              track progress and action items.
            </p>
            <Button asChild>
              <Link href="/app/delivery/projects">
                View Projects
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
