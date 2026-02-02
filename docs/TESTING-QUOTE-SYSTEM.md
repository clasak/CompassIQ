# Testing Checklist: Quote System Enhancement

## Pre-Deployment
- [x] Database migration created (016_quote_enhancements.sql)
- [x] TypeScript interfaces updated
- [x] Server actions updated (createQuote, updateQuote, getQuotesByAccount)
- [x] Quote builder enhanced with tax/discount UI
- [x] PDF export added (browser print)
- [x] Template selector added
- [x] Opportunities integration added
- [x] Account quotes list added
- [x] Code committed and pushed

## Post-Deployment Testing

### 1. Database Migration
- [ ] Apply migration via Supabase dashboard
- [ ] Verify columns exist: `tax_rate`, `discount_type`, `discount_value`, `subtotal`, `grand_total`, `template`
- [ ] Verify existing quotes have updated subtotal/grand_total

### 2. Quote Builder - Tax & Discount
- [ ] Navigate to existing quote
- [ ] Enter tax rate (e.g., 8.5%)
- [ ] Verify tax calculation is correct
- [ ] Change discount type to "Percentage"
- [ ] Enter discount value (e.g., 10%)
- [ ] Verify discount calculation is correct
- [ ] Change discount type to "Fixed"
- [ ] Enter fixed discount (e.g., 500)
- [ ] Verify fixed discount calculation is correct
- [ ] Verify calculation order: Subtotal → Discount → Tax → Grand Total
- [ ] Save quote and verify values persist
- [ ] Refresh page and verify values are correct

### 3. Quote Summary Display
- [ ] Verify summary shows:
  - One-Time Items total
  - Recurring Items total
  - Subtotal
  - Discount (if > 0)
  - After Discount (if discount applied)
  - Tax (if > 0)
  - Grand Total (bold, emphasized)
- [ ] Verify all amounts format correctly as currency

### 4. Template Selector
- [ ] Change template from "Basic" to "Detailed"
- [ ] Save quote
- [ ] Verify template field persists
- [ ] Change back to "Basic"

### 5. PDF Export
- [ ] Click "Export PDF" button
- [ ] Verify browser print dialog opens
- [ ] Verify quote displays correctly in print preview
- [ ] Verify all calculations visible
- [ ] Test "Save as PDF" functionality
- [ ] Verify PDF is readable and professional

### 6. Opportunities → Create Quote
- [ ] Go to Opportunities page
- [ ] Click "..." menu on an opportunity
- [ ] Click "Create Quote"
- [ ] Verify dialog opens with pre-filled quote name
- [ ] Create quote
- [ ] Verify redirected to quote builder
- [ ] Verify account_id and opportunity_id are set correctly
- [ ] Verify quote name matches opportunity name

### 7. Opportunity Detail → Create Quote
- [ ] Go to an opportunity detail page
- [ ] Click "Create Quote" button
- [ ] Verify quote is created
- [ ] Verify navigation to quote page

### 8. Account Detail - Quote History
- [ ] Go to an account detail page
- [ ] Verify "Quote History" section exists
- [ ] Verify all quotes for that account are listed
- [ ] Verify quote name, status, created date, grand total visible
- [ ] Click on a quote
- [ ] Verify navigation to quote detail page works

### 9. Edge Cases
- [ ] Create quote with 0% tax and 0 discount → verify grand total = subtotal
- [ ] Create quote with 100% discount → verify grand total = tax only
- [ ] Create quote with negative line items → verify calculations handle it
- [ ] Create quote with no line items → verify summary shows $0.00
- [ ] Test with very large amounts (e.g., $1,000,000)
- [ ] Test with decimal amounts (e.g., $99.99)

### 10. Data Integrity
- [ ] Create new quote from opportunity
- [ ] Add line items
- [ ] Set tax and discount
- [ ] Save
- [ ] Navigate away and back
- [ ] Verify all values persist correctly
- [ ] Update values and save again
- [ ] Verify updates persist

## Success Criteria
✅ All tax/discount calculations are mathematically correct
✅ PDF export produces professional-looking document
✅ Template switching works and persists
✅ "Create Quote" from opportunities works and pre-fills correctly
✅ Account detail shows all quotes with correct totals
✅ All data persists correctly across page refreshes
✅ No console errors or warnings
✅ Mobile responsive (bonus check)

## Known Issues / Future Enhancements
- [ ] Add custom PDF template rendering (beyond browser print)
- [ ] Add terms & conditions section to detailed template
- [ ] Add expiration date field to quotes
- [ ] Add quote approval workflow
- [ ] Add email quote functionality
