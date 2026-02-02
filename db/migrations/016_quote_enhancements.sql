-- Migration: Enhance quotes table with tax, discount, and template support
-- Date: 2026-01-31

-- Add new columns to quotes table
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0 CHECK (tax_rate >= 0 AND tax_rate <= 100),
ADD COLUMN IF NOT EXISTS discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
ADD COLUMN IF NOT EXISTS discount_value DECIMAL(10,2) DEFAULT 0 CHECK (discount_value >= 0),
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS grand_total DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS template TEXT DEFAULT 'basic' CHECK (template IN ('basic', 'detailed'));

-- Update existing quotes to calculate subtotal and grand_total from existing data
UPDATE quotes
SET 
  subtotal = one_time_total + recurring_total,
  grand_total = one_time_total + recurring_total
WHERE subtotal = 0 AND grand_total = 0;

-- Add comment
COMMENT ON COLUMN quotes.tax_rate IS 'Tax rate as percentage (e.g., 8.5 for 8.5%)';
COMMENT ON COLUMN quotes.discount_type IS 'Type of discount: percentage or fixed amount';
COMMENT ON COLUMN quotes.discount_value IS 'Discount value (percentage or fixed amount depending on discount_type)';
COMMENT ON COLUMN quotes.subtotal IS 'Sum of all line items before tax and discount';
COMMENT ON COLUMN quotes.grand_total IS 'Final total after applying discount and tax';
COMMENT ON COLUMN quotes.template IS 'Quote template to use for display/PDF export';
