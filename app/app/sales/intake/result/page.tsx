'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Building2, TrendingUp, CheckSquare, FileText, ArrowRight } from 'lucide-react'

interface CreatedIds {
  accountIds?: string[]
  opportunityIds?: string[]
  taskIds?: string[]
  quoteIds?: string[]
}

export default function IntakeResultPage() {
  const searchParams = useSearchParams()
  const [previewWorkspaceId, setPreviewWorkspaceId] = useState<string | null>(null)
  const [createdIds, setCreatedIds] = useState<CreatedIds>({})

  useEffect(() => {
    const previewId = searchParams.get('previewWorkspaceId')
    const accountIds = searchParams.get('accountIds')?.split(',').filter(Boolean) || []
    const opportunityIds = searchParams.get('opportunityIds')?.split(',').filter(Boolean) || []
    const taskIds = searchParams.get('taskIds')?.split(',').filter(Boolean) || []
    const quoteIds = searchParams.get('quoteIds')?.split(',').filter(Boolean) || []

    setPreviewWorkspaceId(previewId)
    setCreatedIds({
      accountIds: accountIds.length > 0 ? accountIds : undefined,
      opportunityIds: opportunityIds.length > 0 ? opportunityIds : undefined,
      taskIds: taskIds.length > 0 ? taskIds : undefined,
      quoteIds: quoteIds.length > 0 ? quoteIds : undefined,
    })
  }, [searchParams])

  const hasCreatedRecords = 
    createdIds.accountIds?.length ||
    createdIds.opportunityIds?.length ||
    createdIds.taskIds?.length ||
    createdIds.quoteIds?.length

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <CardTitle>Import Complete!</CardTitle>
              <CardDescription>
                Preview workspace created successfully
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {previewWorkspaceId && (
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Preview Workspace ID</div>
              <div className="font-mono text-sm bg-muted p-2 rounded">{previewWorkspaceId}</div>
            </div>
          )}

          {hasCreatedRecords && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Created Records</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {createdIds.accountIds && createdIds.accountIds.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Accounts ({createdIds.accountIds.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {createdIds.accountIds.slice(0, 3).map((id) => (
                          <Button key={id} variant="outline" size="sm" className="w-full justify-start" asChild>
                            <Link href={`/app/crm/accounts/${id}`}>
                              View Account
                              <ArrowRight className="h-3 w-3 ml-2" />
                            </Link>
                          </Button>
                        ))}
                        {createdIds.accountIds.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{createdIds.accountIds.length - 3} more
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {createdIds.opportunityIds && createdIds.opportunityIds.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Opportunities ({createdIds.opportunityIds.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {createdIds.opportunityIds.slice(0, 3).map((id) => (
                          <Button key={id} variant="outline" size="sm" className="w-full justify-start" asChild>
                            <Link href={`/app/crm/opportunities/${id}`}>
                              View Opportunity
                              <ArrowRight className="h-3 w-3 ml-2" />
                            </Link>
                          </Button>
                        ))}
                        {createdIds.opportunityIds.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{createdIds.opportunityIds.length - 3} more
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {createdIds.taskIds && createdIds.taskIds.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckSquare className="h-4 w-4" />
                        Tasks ({createdIds.taskIds.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {createdIds.taskIds.slice(0, 3).map((id) => (
                          <Button key={id} variant="outline" size="sm" className="w-full justify-start" asChild>
                            <Link href={`/app/crm/tasks/${id}`}>
                              View Task
                              <ArrowRight className="h-3 w-3 ml-2" />
                            </Link>
                          </Button>
                        ))}
                        {createdIds.taskIds.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{createdIds.taskIds.length - 3} more
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {createdIds.quoteIds && createdIds.quoteIds.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Quotes ({createdIds.quoteIds.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {createdIds.quoteIds.slice(0, 3).map((id) => (
                          <Button key={id} variant="outline" size="sm" className="w-full justify-start" asChild>
                            <Link href={`/app/crm/quotes/${id}`}>
                              View Quote
                              <ArrowRight className="h-3 w-3 ml-2" />
                            </Link>
                          </Button>
                        ))}
                        {createdIds.quoteIds.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{createdIds.quoteIds.length - 3} more
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button asChild>
              <Link href="/app">Go to Command Center</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/app/sales/intake">Import Another</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
