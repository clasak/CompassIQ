'use server'

import { createClient } from '@/lib/supabase/server'
import { requireOrgContext, requireAdmin } from '@/lib/org-context'
import { revalidatePath } from 'next/cache'
import { normalizeError } from '@/lib/errors'

// ============================================================
// LEADS
// ============================================================

export interface Lead {
  id: string
  org_id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  source: string | null
  status: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ListLeadsResult {
  success: boolean
  leads?: Lead[]
  error?: string
}

export async function listLeads(): Promise<ListLeadsResult> {
  try {
    const context = await requireOrgContext()
    if (!context) {
      return { success: false, error: 'No organization context' }
    }

    if (context.isDemo) {
      return { success: false, error: 'DEMO_READ_ONLY' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('org_id', context.orgId)
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: normalizeError(error) }
    }

    return { success: true, leads: data || [] }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to list leads' }
  }
}

export interface CreateLeadResult {
  success: boolean
  lead?: Lead
  error?: string
}

export async function createLead(data: {
  name: string
  company?: string
  email?: string
  phone?: string
  source?: string
  status?: string
  notes?: string
}): Promise<CreateLeadResult> {
  try {
    const context = await requireAdmin()

    if (context.isDemo) {
      return { success: false, error: 'DEMO_READ_ONLY' }
    }

    const supabase = await createClient()
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        org_id: context.orgId,
        name: data.name,
        company: data.company || null,
        email: data.email || null,
        phone: data.phone || null,
        source: data.source || null,
        status: data.status || 'new',
        notes: data.notes || null,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: normalizeError(error) }
    }

    revalidatePath('/app/crm/leads')
    return { success: true, lead }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create lead' }
  }
}

export interface UpdateLeadResult {
  success: boolean
  lead?: Lead
  error?: string
}

export async function updateLead(
  id: string,
  data: Partial<{
    name: string
    company: string
    email: string
    phone: string
    source: string
    status: string
    notes: string
  }>
): Promise<UpdateLeadResult> {
  try {
    const context = await requireAdmin()

    if (context.isDemo) {
      return { success: false, error: 'DEMO_READ_ONLY' }
    }

    const supabase = await createClient()
    const { data: lead, error } = await supabase
      .from('leads')
      .update(data)
      .eq('id', id)
      .eq('org_id', context.orgId)
      .select()
      .single()

    if (error) {
      return { success: false, error: normalizeError(error) }
    }

    revalidatePath('/app/crm/leads')
    return { success: true, lead }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update lead' }
  }
}

export interface DeleteLeadResult {
  success: boolean
  error?: string
}

export async function deleteLead(id: string): Promise<DeleteLeadResult> {
  try {
    const context = await requireAdmin()

    if (context.isDemo) {
      return { success: false, error: 'DEMO_READ_ONLY' }
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
      .eq('org_id', context.orgId)

    if (error) {
      return { success: false, error: normalizeError(error) }
    }

    revalidatePath('/app/crm/leads')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete lead' }
  }
}

// ============================================================
// ACCOUNTS
// ============================================================

export interface Account {
  id: string
  org_id: string
  name: string
  segment: string | null
  industry: string | null
  website: string | null
  status: string
  renewal_date: string | null
  health_override: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ListAccountsResult {
  success: boolean
  accounts?: Account[]
  error?: string
}

export async function listAccounts(): Promise<ListAccountsResult> {
  try {
    const context = await requireOrgContext()
    if (!context) {
      return { success: false, error: 'No organization context' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('org_id', context.orgId)
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: normalizeError(error) }
    }

    return { success: true, accounts: data || [] }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to list accounts' }
  }
}

export interface CreateAccountResult {
  success: boolean
  account?: Account
  error?: string
}

export async function createAccount(data: {
  name: string
  segment?: string
  industry?: string
  website?: string
  status?: string
  notes?: string
}): Promise<CreateAccountResult> {
  try {
    const context = await requireAdmin()

    if (context.isDemo) {
      return { success: false, error: 'DEMO_READ_ONLY' }
    }

    const supabase = await createClient()
    const { data: account, error } = await supabase
      .from('accounts')
      .insert({
        org_id: context.orgId,
        name: data.name,
        segment: data.segment || null,
        industry: data.industry || null,
        website: data.website || null,
        status: data.status || 'ACTIVE',
        notes: data.notes || null,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: normalizeError(error) }
    }

    revalidatePath('/app/crm/accounts')
    return { success: true, account }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create account' }
  }
}

export interface UpdateAccountResult {
  success: boolean
  account?: Account
  error?: string
}

export async function updateAccount(
  id: string,
  data: Partial<{
    name: string
    segment: string
    industry: string
    website: string
    status: string
    notes: string
  }>
): Promise<UpdateAccountResult> {
  try {
    const context = await requireAdmin()

    if (context.isDemo) {
      return { success: false, error: 'DEMO_READ_ONLY' }
    }

    const supabase = await createClient()
    const { data: account, error } = await supabase
      .from('accounts')
      .update(data)
      .eq('id', id)
      .eq('org_id', context.orgId)
      .select()
      .single()

    if (error) {
      return { success: false, error: normalizeError(error) }
    }

    revalidatePath('/app/crm/accounts')
    return { success: true, account }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update account' }
  }
}

export interface DeleteAccountResult {
  success: boolean
  error?: string
}

export async function deleteAccount(id: string): Promise<DeleteAccountResult> {
  try {
    const context = await requireAdmin()

    if (context.isDemo) {
      return { success: false, error: 'DEMO_READ_ONLY' }
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)
      .eq('org_id', context.orgId)

    if (error) {
      return { success: false, error: normalizeError(error) }
    }

    revalidatePath('/app/crm/accounts')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete account' }
  }
}

// ============================================================
// OPPORTUNITIES
// ============================================================

export interface Opportunity {
  id: string
  org_id: string
  account_id: string
  name: string
  stage: string
  amount: number
  close_date: string | null
  source: string | null
  owner_id: string | null
  created_at: string
  updated_at: string
}

export interface ListOpportunitiesResult {
  success: boolean
  opportunities?: Opportunity[]
  error?: string
}

export async function listOpportunities(): Promise<ListOpportunitiesResult> {
  try {
    const context = await requireOrgContext()
    if (!context) {
      return { success: false, error: 'No organization context' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('org_id', context.orgId)
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: normalizeError(error) }
    }

    return { success: true, opportunities: data || [] }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to list opportunities' }
  }
}

export interface CreateOpportunityResult {
  success: boolean
  opportunity?: Opportunity
  error?: string
}

export async function createOpportunity(data: {
  account_id: string
  name: string
  stage?: string
  amount?: number
  close_date?: string
  source?: string
  owner_id?: string
}): Promise<CreateOpportunityResult> {
  try {
    const context = await requireAdmin()

    if (context.isDemo) {
      return { success: false, error: 'DEMO_READ_ONLY' }
    }

    const supabase = await createClient()
    const { data: opportunity, error } = await supabase
      .from('opportunities')
      .insert({
        org_id: context.orgId,
        account_id: data.account_id,
        name: data.name,
        stage: data.stage || 'LEAD',
        amount: data.amount || 0,
        close_date: data.close_date || null,
        source: data.source || null,
        owner_id: data.owner_id || null,
        owner_user_id: data.owner_id || null, // Keep both for compatibility
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: normalizeError(error) }
    }

    revalidatePath('/app/crm/opportunities')
    return { success: true, opportunity }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create opportunity' }
  }
}

export interface UpdateOpportunityResult {
  success: boolean
  opportunity?: Opportunity
  error?: string
}

export async function updateOpportunity(
  id: string,
  data: Partial<{
    account_id: string
    name: string
    stage: string
    amount: number
    close_date: string
    source: string
    owner_id: string
  }>
): Promise<UpdateOpportunityResult> {
  try {
    const context = await requireAdmin()

    if (context.isDemo) {
      return { success: false, error: 'DEMO_READ_ONLY' }
    }

    const updateData: any = { ...data }
    if (data.owner_id !== undefined) {
      updateData.owner_user_id = data.owner_id // Keep both for compatibility
    }

    const supabase = await createClient()
    const { data: opportunity, error } = await supabase
      .from('opportunities')
      .update(updateData)
      .eq('id', id)
      .eq('org_id', context.orgId)
      .select()
      .single()

    if (error) {
      return { success: false, error: normalizeError(error) }
    }

    revalidatePath('/app/crm/opportunities')
    return { success: true, opportunity }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update opportunity' }
  }
}

export interface DeleteOpportunityResult {
  success: boolean
  error?: string
}

export async function deleteOpportunity(id: string): Promise<DeleteOpportunityResult> {
  try {
    const context = await requireAdmin()

    if (context.isDemo) {
      return { success: false, error: 'DEMO_READ_ONLY' }
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', id)
      .eq('org_id', context.orgId)

    if (error) {
      return { success: false, error: normalizeError(error) }
    }

    revalidatePath('/app/crm/opportunities')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete opportunity' }
  }
}

// ============================================================
// QUOTES
// ============================================================

export interface QuoteLineItem {
  id: string
  org_id: string
  quote_id: string
  type: 'one_time' | 'recurring'
  title: string
  description: string | null
  qty: number
  unit_price: number
  total: number
  created_at: string
}

export interface Quote {
  id: string
  org_id: string
  account_id: string
  opportunity_id: string | null
  name: string
  status: string
  currency: string
  one_time_total: number
  recurring_total: number
  created_at: string
  updated_at: string
}

export interface QuoteWithLineItems extends Quote {
  line_items?: QuoteLineItem[]
}

export interface ListQuotesResult {
  success: boolean
  quotes?: Quote[]
  error?: string
}

export async function listQuotes(): Promise<ListQuotesResult> {
  try {
    const context = await requireOrgContext()
    if (!context) {
      return { success: false, error: 'No organization context' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('org_id', context.orgId)
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: normalizeError(error) }
    }

    return { success: true, quotes: data || [] }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to list quotes' }
  }
}

export interface GetQuoteResult {
  success: boolean
  quote?: QuoteWithLineItems
  error?: string
}

export async function getQuote(id: string): Promise<GetQuoteResult> {
  try {
    const context = await requireOrgContext()
    if (!context) {
      return { success: false, error: 'No organization context' }
    }

    const supabase = await createClient()
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .eq('org_id', context.orgId)
      .single()

    if (quoteError) {
      return { success: false, error: normalizeError(quoteError) }
    }

    const { data: lineItems, error: itemsError } = await supabase
      .from('quote_line_items')
      .select('*')
      .eq('quote_id', id)
      .eq('org_id', context.orgId)
      .order('created_at', { ascending: true })

    if (itemsError) {
      return { success: false, error: normalizeError(itemsError) }
    }

    return {
      success: true,
      quote: {
        ...quote,
        line_items: lineItems || [],
      },
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to get quote' }
  }
}

export interface CreateQuoteResult {
  success: boolean
  quote?: Quote
  error?: string
}

export async function createQuote(data: {
  account_id: string
  opportunity_id?: string
  name: string
  status?: string
  currency?: string
}): Promise<CreateQuoteResult> {
  try {
    const context = await requireAdmin()

    if (context.isDemo) {
      return { success: false, error: 'DEMO_READ_ONLY' }
    }

    const supabase = await createClient()
    const { data: quote, error } = await supabase
      .from('quotes')
      .insert({
        org_id: context.orgId,
        account_id: data.account_id,
        opportunity_id: data.opportunity_id || null,
        name: data.name,
        status: data.status || 'draft',
        currency: data.currency || 'USD',
        one_time_total: 0,
        recurring_total: 0,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: normalizeError(error) }
    }

    revalidatePath('/app/crm/quotes')
    return { success: true, quote }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create quote' }
  }
}

export interface UpdateQuoteResult {
  success: boolean
  quote?: Quote
  error?: string
}

export async function updateQuote(
  id: string,
  data: Partial<{
    account_id: string
    opportunity_id: string
    name: string
    status: string
    currency: string
  }>
): Promise<UpdateQuoteResult> {
  try {
    const context = await requireAdmin()

    if (context.isDemo) {
      return { success: false, error: 'DEMO_READ_ONLY' }
    }

    const supabase = await createClient()
    const { data: quote, error } = await supabase
      .from('quotes')
      .update(data)
      .eq('id', id)
      .eq('org_id', context.orgId)
      .select()
      .single()

    if (error) {
      return { success: false, error: normalizeError(error) }
    }

    revalidatePath('/app/crm/quotes')
    revalidatePath(`/app/crm/quotes/${id}`)
    return { success: true, quote }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update quote' }
  }
}

export interface UpsertQuoteLineItemsResult {
  success: boolean
  line_items?: QuoteLineItem[]
  error?: string
}

export async function upsertQuoteLineItems(
  quoteId: string,
  items: Array<{
    id?: string
    type: 'one_time' | 'recurring'
    title: string
    description?: string
    qty: number
    unit_price: number
  }>
): Promise<UpsertQuoteLineItemsResult> {
  try {
    const context = await requireAdmin()

    if (context.isDemo) {
      return { success: false, error: 'DEMO_READ_ONLY' }
    }

    const supabase = await createClient()

    // Verify quote exists and belongs to org
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('id')
      .eq('id', quoteId)
      .eq('org_id', context.orgId)
      .single()

    if (quoteError || !quote) {
      return { success: false, error: 'Quote not found' }
    }

    // Delete existing items
    await supabase
      .from('quote_line_items')
      .delete()
      .eq('quote_id', quoteId)
      .eq('org_id', context.orgId)

    // Insert new items
    const lineItemsToInsert = items.map((item) => ({
      org_id: context.orgId,
      quote_id: quoteId,
      type: item.type,
      title: item.title,
      description: item.description || null,
      qty: item.qty,
      unit_price: item.unit_price,
    }))

    const { data: lineItems, error: insertError } = await supabase
      .from('quote_line_items')
      .insert(lineItemsToInsert)
      .select()

    if (insertError) {
      return { success: false, error: normalizeError(insertError) }
    }

    // Recalculate totals
    const oneTimeTotal =
      lineItems
        ?.filter((item) => item.type === 'one_time')
        .reduce((sum, item) => sum + Number(item.total || 0), 0) || 0

    const recurringTotal =
      lineItems
        ?.filter((item) => item.type === 'recurring')
        .reduce((sum, item) => sum + Number(item.total || 0), 0) || 0

    // Update quote totals
    await supabase
      .from('quotes')
      .update({
        one_time_total: oneTimeTotal,
        recurring_total: recurringTotal,
      })
      .eq('id', quoteId)
      .eq('org_id', context.orgId)

    revalidatePath('/app/crm/quotes')
    revalidatePath(`/app/crm/quotes/${quoteId}`)

    return { success: true, line_items: lineItems || [] }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update quote line items' }
  }
}

export interface DeleteQuoteResult {
  success: boolean
  error?: string
}

export async function deleteQuote(id: string): Promise<DeleteQuoteResult> {
  try {
    const context = await requireAdmin()

    if (context.isDemo) {
      return { success: false, error: 'DEMO_READ_ONLY' }
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id)
      .eq('org_id', context.orgId)

    if (error) {
      return { success: false, error: normalizeError(error) }
    }

    revalidatePath('/app/crm/quotes')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete quote' }
  }
}

