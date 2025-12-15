'use client'

import { useState, useEffect } from 'react'
import { QuoteWithLineItems, Account, updateQuote, upsertQuoteLineItems } from '@/lib/actions/crm-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { isDemoOrgError } from '@/lib/errors'
import { ActionButton } from '@/components/ui/action-button'
import { Save, Plus, Trash2, Send, CheckCircle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface QuoteBuilderProps {
  quote: QuoteWithLineItems
  accounts: Account[]
}

const PACKAGE_TEMPLATES = {
  diagnostic: {
    name: 'Diagnostic Package',
    items: [
      { type: 'one_time' as const, title: 'Initial Assessment', description: 'Comprehensive business analysis', qty: 1, unit_price: 5000 },
      { type: 'one_time' as const, title: 'Data Audit', description: 'Review of current systems and processes', qty: 1, unit_price: 3000 },
    ],
  },
  implementation: {
    name: 'Implementation Package',
    items: [
      { type: 'one_time' as const, title: 'System Setup', description: 'Initial configuration and integration', qty: 1, unit_price: 15000 },
      { type: 'one_time' as const, title: 'Data Migration', description: 'Historical data import and validation', qty: 1, unit_price: 10000 },
      { type: 'one_time' as const, title: 'Training', description: 'Team training and onboarding', qty: 1, unit_price: 5000 },
    ],
  },
  retainer: {
    name: 'Monthly Retainer',
    items: [
      { type: 'recurring' as const, title: 'Monthly Support', description: 'Ongoing maintenance and support', qty: 1, unit_price: 5000 },
      { type: 'recurring' as const, title: 'Monthly Reporting', description: 'Custom reports and analytics', qty: 1, unit_price: 2000 },
    ],
  },
}

export function QuoteBuilder({ quote: initialQuote, accounts }: QuoteBuilderProps) {
  const router = useRouter()
  const [quote, setQuote] = useState(initialQuote)
  const [lineItems, setLineItems] = useState(quote.line_items || [])
  const [saving, setSaving] = useState(false)
  const [quoteName, setQuoteName] = useState(quote.name)
  const [quoteStatus, setQuoteStatus] = useState(quote.status)

  // Recalculate totals when line items change
  useEffect(() => {
    const oneTimeTotal = lineItems
      .filter((item) => item.type === 'one_time')
      .reduce((sum, item) => sum + Number(item.total || 0), 0)

    const recurringTotal = lineItems
      .filter((item) => item.type === 'recurring')
      .reduce((sum, item) => sum + Number(item.total || 0), 0)

    setQuote({
      ...quote,
      one_time_total: oneTimeTotal,
      recurring_total: recurringTotal,
    })
  }, [lineItems])

  async function handleSave() {
    setSaving(true)

    try {
      // Update quote name/status if changed
      if (quoteName !== quote.name || quoteStatus !== quote.status) {
        const updateResult = await updateQuote(quote.id, {
          name: quoteName,
          status: quoteStatus,
        })

        if (updateResult.error) {
          if (isDemoOrgError({ message: updateResult.error })) {
            toast.error('Demo organization is read-only')
          } else {
            toast.error(updateResult.error)
          }
          return
        }
      }

      // Save line items
      const itemsResult = await upsertQuoteLineItems(
        quote.id,
        lineItems.map((item) => ({
          id: item.id,
          type: item.type,
          title: item.title,
          description: item.description || undefined,
          qty: item.qty,
          unit_price: item.unit_price,
        }))
      )

      if (itemsResult.error) {
        if (isDemoOrgError({ message: itemsResult.error })) {
          toast.error('Demo organization is read-only')
        } else {
          toast.error(itemsResult.error)
        }
        return
      }

      toast.success('Quote saved successfully')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save quote')
    } finally {
      setSaving(false)
    }
  }

  function handleAddPackage(packageKey: keyof typeof PACKAGE_TEMPLATES) {
    const template = PACKAGE_TEMPLATES[packageKey]
    const newItems = template.items.map((item) => ({
      id: `temp-${Date.now()}-${Math.random()}`,
      org_id: quote.org_id,
      quote_id: quote.id,
      type: item.type,
      title: item.title,
      description: item.description,
      qty: item.qty,
      unit_price: item.unit_price,
      total: item.qty * item.unit_price,
      created_at: new Date().toISOString(),
    }))
    setLineItems([...lineItems, ...newItems])
  }

  function handleAddLineItem() {
    const newItem = {
      id: `temp-${Date.now()}-${Math.random()}`,
      org_id: quote.org_id,
      quote_id: quote.id,
      type: 'one_time' as const,
      title: '',
      description: null,
      qty: 1,
      unit_price: 0,
      total: 0,
      created_at: new Date().toISOString(),
    }
    setLineItems([...lineItems, newItem])
  }

  function handleUpdateLineItem(index: number, field: string, value: any) {
    const updated = [...lineItems]
    updated[index] = {
      ...updated[index],
      [field]: value,
    }
    // Recalculate total
    updated[index].total = updated[index].qty * updated[index].unit_price
    setLineItems(updated)
  }

  function handleRemoveLineItem(index: number) {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  async function handleUpdateStatus(newStatus: string) {
    setSaving(true)
    try {
      const result = await updateQuote(quote.id, { status: newStatus })
      if (result.error) {
        if (isDemoOrgError({ message: result.error })) {
          toast.error('Demo organization is read-only')
        } else {
          toast.error(result.error)
        }
        return
      }
      setQuoteStatus(newStatus)
      toast.success('Quote status updated')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  const oneTimeTotal = lineItems
    .filter((item) => item.type === 'one_time')
    .reduce((sum, item) => sum + Number(item.total || 0), 0)

  const recurringTotal = lineItems
    .filter((item) => item.type === 'recurring')
    .reduce((sum, item) => sum + Number(item.total || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quote Builder</h1>
          <p className="text-muted-foreground">Build and manage your quote</p>
        </div>
        <div className="flex gap-2">
          <ActionButton actionType="admin" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Quote'}
          </ActionButton>
          {quoteStatus === 'draft' && (
            <ActionButton
              actionType="admin"
              onClick={() => handleUpdateStatus('sent')}
              disabled={saving}
            >
              <Send className="h-4 w-4 mr-2" />
              Mark as Sent
            </ActionButton>
          )}
          {quoteStatus === 'sent' && (
            <>
              <ActionButton
                actionType="admin"
                onClick={() => handleUpdateStatus('won')}
                disabled={saving}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Won
              </ActionButton>
              <ActionButton
                actionType="admin"
                onClick={() => handleUpdateStatus('lost')}
                disabled={saving}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Mark as Lost
              </ActionButton>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quote Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Quote Name</Label>
              <Input
                id="name"
                value={quoteName}
                onChange={(e) => setQuoteName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{quoteStatus}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Line Items</CardTitle>
            <div className="flex gap-2">
              <Select onValueChange={(value) => handleAddPackage(value as keyof typeof PACKAGE_TEMPLATES)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Add Package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diagnostic">Diagnostic Package</SelectItem>
                  <SelectItem value="implementation">Implementation Package</SelectItem>
                  <SelectItem value="retainer">Monthly Retainer</SelectItem>
                </SelectContent>
              </Select>
              <ActionButton actionType="admin" onClick={handleAddLineItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </ActionButton>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lineItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No line items yet. Add a package or create a custom item.
              </p>
            ) : (
              lineItems.map((item, index) => (
                <div key={item.id || index} className="border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-3">
                      <Label>Type</Label>
                      <Select
                        value={item.type}
                        onValueChange={(value) =>
                          handleUpdateLineItem(index, 'type', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one_time">One-Time</SelectItem>
                          <SelectItem value="recurring">Recurring</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-12 md:col-span-4">
                      <Label>Title</Label>
                      <Input
                        value={item.title}
                        onChange={(e) =>
                          handleUpdateLineItem(index, 'title', e.target.value)
                        }
                        placeholder="Item title"
                      />
                    </div>
                    <div className="col-span-12 md:col-span-3">
                      <Label>Qty</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.qty}
                        onChange={(e) =>
                          handleUpdateLineItem(index, 'qty', parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div className="col-span-12 md:col-span-2">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) =>
                          handleUpdateLineItem(
                            index,
                            'unit_price',
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-9">
                      <Label>Description</Label>
                      <Input
                        value={item.description || ''}
                        onChange={(e) =>
                          handleUpdateLineItem(index, 'description', e.target.value)
                        }
                        placeholder="Optional description"
                      />
                    </div>
                    <div className="col-span-12 md:col-span-2 flex items-end">
                      <div>
                        <Label>Total</Label>
                        <div className="text-lg font-semibold">
                          {formatCurrency(item.total || 0)}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-1 flex items-end">
                      <ActionButton
                        actionType="admin"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLineItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </ActionButton>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quote Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>One-Time Total:</span>
              <span className="font-semibold">{formatCurrency(oneTimeTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Recurring Total:</span>
              <span className="font-semibold">{formatCurrency(recurringTotal)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Grand Total:</span>
              <span>{formatCurrency(oneTimeTotal + recurringTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

