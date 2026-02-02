'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Quote, getQuotesByAccount } from '@/lib/actions/crm-actions'
import { formatDate, formatCurrency } from '@/lib/utils'
import { FileText, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AccountQuotesListProps {
  accountId: string
}

export function AccountQuotesList({ accountId }: AccountQuotesListProps) {
  const router = useRouter()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadQuotes() {
      setLoading(true)
      try {
        const result = await getQuotesByAccount(accountId)
        if (result.error) {
          setError(result.error)
        } else {
          setQuotes(result.quotes || [])
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load quotes')
      } finally {
        setLoading(false)
      }
    }
    loadQuotes()
  }, [accountId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quotes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Loading quotes...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quotes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Quotes ({quotes.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <p className="text-muted-foreground text-sm">No quotes found for this account.</p>
        ) : (
          <div className="space-y-3">
            {quotes.map((quote) => (
              <div
                key={quote.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{quote.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {quote.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Created {formatDate(quote.created_at)}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(quote.grand_total || 0)}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/app/crm/quotes/${quote.id}`)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
