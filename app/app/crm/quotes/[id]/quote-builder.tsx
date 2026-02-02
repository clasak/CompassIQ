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
import { Save, Plus, Trash2, Send, CheckCircle, XCircle, FileText, Download } from 'lucide-react'
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
  const [taxRate, setTaxRate] = useState(quote.tax_rate || 0)
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(quote.discount_type || 'percentage')
  const [discountValue, setDiscountValue] = useState(quote.discount_value || 0)
  const [template, setTemplate] = useState<'basic' | 'detailed'>(quote.template || 'basic')

  // Calculate totals based on approved formula
  const calculateTotals = () => {
    // Step 1: Subtotal = sum of all line items
    const subtotal = lineItems.reduce((sum, item) => sum + Number(item.total || 0), 0)
    
    // Step 2: Apply discount
    let discountAmount = 0
    if (discountType === 'percentage') {
      discountAmount = (subtotal * discountValue) / 100
    } else {
      discountAmount = discountValue
    }
    const afterDiscount = subtotal - discountAmount
    
    // Step 3: Apply tax on discounted amount
    const taxAmount = (afterDiscount * taxRate) / 100
    
    // Step 4: Grand total
    const grandTotal = afterDiscount + taxAmount
    
    return {
      subtotal,
      discountAmount,
      afterDiscount,
      taxAmount,
      grandTotal,
    }
  }

  const totals = calculateTotals()

  async function handleSave() {
    setSaving(true)

    try {
      // Update quote with all fields including tax, discount, and calculated totals
      const updateData = {
        name: quoteName,
        status: quoteStatus,
        tax_rate: taxRate,
        discount_type: discountType,
        discount_value: discountValue,
        subtotal: totals.subtotal,
        grand_total: totals.grandTotal,
        template: template,
      }

      const updateResult = await updateQuote(quote.id, updateData)

      if (updateResult.error) {
        if (isDemoOrgError({ message: updateResult.error })) {
          toast.error('Demo organization is read-only')
        } else {
          toast.error(updateResult.error)
        }
        return
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

  function handleExportPDF() {
    // Simple browser print for PDF export
    window.print()
  }

  const oneTimeTotal = lineItems
    .filter((item) => item.type === 'one_time')
    .reduce((sum, item) => sum + Number(item.total || 0), 0)

  const recurringTotal = lineItems
    .filter((item) => item.type === 'recurring')
    .reduce((sum, item) => sum + Number(item.total || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-3xl font-bold">Quote Builder</h1>
          <p className="text-muted-foreground">Build and manage your quote</p>
        </div>
        <div className="flex gap-2">
          <ActionButton actionType="admin" onClick={handleExportPDF} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </ActionButton>
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
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Quote Name</Label>
              <Input
                id="name"
                value={quoteName}
                onChange={(e) => setQuoteName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select value={template} onValueChange={(value: 'basic' | 'detailed') => setTemplate(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="flex gap-2 no-print">
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
                      <Label>Description {template === 'detailed' ? '(shown in detailed view)' : ''}</Label>
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
                    <div className="col-span-12 md:col-span-1 flex items-end no-print">
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
          <CardTitle>Tax & Discount</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountType">Discount Type</Label>
              <Select value={discountType} onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountValue">
                Discount Value {discountType === 'percentage' ? '(%)' : '($)'}
              </Label>
              <Input
                id="discountValue"
                type="number"
                step="0.01"
                min="0"
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quote Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">One-Time Items:</span>
              <span>{formatCurrency(oneTimeTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Recurring Items:</span>
              <span>{formatCurrency(recurringTotal)}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t">
              <span>Subtotal:</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount ({discountType === 'percentage' ? `${discountValue}%` : formatCurrency(discountValue)}):</span>
                <span>-{formatCurrency(totals.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">After Discount:</span>
              <span>{formatCurrency(totals.afterDiscount)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax ({taxRate}%):</span>
                <span>{formatCurrency(totals.taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold pt-2 border-t-2">
              <span>Grand Total:</span>
              <span>{formatCurrency(totals.grandTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}
