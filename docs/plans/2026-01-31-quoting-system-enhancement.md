# CompassIQ Quoting System Enhancement Plan

**Date:** 2026-01-31
**Status:** In Progress
**Priority:** High

## Overview
Enhance the existing quote builder with tax/discount calculations, PDF export, templates, and integrate quoting into opportunities and accounts.

## Calculation Logic (Approved)
1. Subtotal = sum of all line items
2. Apply discount (percentage or fixed)
3. Apply tax on discounted amount
4. Grand total

## Implementation Tasks

### Phase 1: Database Schema Migration
- [ ] Add columns to `quotes` table:
  - `tax_rate` DECIMAL(5,2) DEFAULT 0
  - `discount_type` TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed'))
  - `discount_value` DECIMAL(10,2) DEFAULT 0
  - `subtotal` DECIMAL(10,2) DEFAULT 0
  - `grand_total` DECIMAL(10,2) DEFAULT 0
  - `template` TEXT DEFAULT 'basic' (for quote templates)
- [ ] Create migration file
- [ ] Apply migration to production

### Phase 2: Quote Builder Enhancement
- [ ] Add tax_rate input field (percentage)
- [ ] Add discount_type selector (percentage/fixed)
- [ ] Add discount_value input field
- [ ] Update calculation logic to compute:
  - Subtotal
  - Discount amount
  - After discount
  - Tax amount
  - Grand total
- [ ] Update quote summary card with new breakdown
- [ ] Update save handler to persist tax/discount fields
- [ ] Add template selector (Basic/Detailed)

### Phase 3: PDF Export
- [ ] Install `react-to-print` or use browser print dialog
- [ ] Create printable quote view component
- [ ] Add "Export PDF" button to quote builder
- [ ] Style print-friendly quote layout

### Phase 4: Quote Templates
- [ ] Create `QuoteTemplate` component
- [ ] Implement "Basic" template (simple line items)
- [ ] Implement "Detailed" template (with descriptions, terms)
- [ ] Add template selector to quote builder
- [ ] Store selected template in database

### Phase 5: Opportunities Integration
- [ ] Add "Create Quote" button to opportunities table dropdown
- [ ] Add "Create Quote" button to opportunity detail page
- [ ] Create dialog/flow that pre-fills:
  - Opportunity ID
  - Account ID
  - Opportunity amount as initial line item
- [ ] Update opportunities-table.tsx
- [ ] Update opportunity-detail-view.tsx

### Phase 6: Account Detail Integration
- [ ] Query quotes for account in account detail page
- [ ] Create quotes list component for account detail
- [ ] Add quotes section to AccountDetailView
- [ ] Show quote name, status, total, created date
- [ ] Link to quote detail pages

### Phase 7: Update Server Actions
- [ ] Update `createQuote` to accept tax/discount/template
- [ ] Update `updateQuote` to handle new fields
- [ ] Add `getQuotesByAccountId` action
- [ ] Update TypeScript interfaces

### Phase 8: Testing & Deployment
- [ ] Test all calculations manually
- [ ] Test PDF export
- [ ] Test template switching
- [ ] Test opportunity → quote creation
- [ ] Test account quote history
- [ ] Deploy to Vercel production

## File Changes Required
1. `/lib/actions/crm-actions.ts` - Update Quote interface, add server actions
2. `/app/app/crm/quotes/[id]/quote-builder.tsx` - Add tax/discount UI, PDF export
3. `/app/app/crm/opportunities/opportunities-table.tsx` - Add "Create Quote" action
4. `/app/app/crm/opportunities/[id]/opportunity-detail-view.tsx` - Add "Create Quote" button
5. `/app/app/crm/accounts/[id]/account-detail-view.tsx` - Add quotes section
6. `/components/quotes/quote-template.tsx` - New component for templates
7. `/components/quotes/printable-quote.tsx` - New component for PDF export
8. Migration SQL file

## Success Criteria
- ✅ Tax and discount fields functional with correct calculations
- ✅ PDF export generates professional quote document
- ✅ Template switching works between Basic/Detailed
- ✅ "Create Quote" from opportunity pre-fills correctly
- ✅ Account detail shows all quotes for that account
- ✅ Deployed to production at v2-dusky-pi.vercel.app

## Rollback Plan
- Migration is additive (new columns with defaults)
- Can revert deployment via Vercel dashboard
- Database columns can be dropped if needed
