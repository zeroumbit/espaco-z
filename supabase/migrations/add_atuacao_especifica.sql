-- ============================================
-- MIGRATION: Add atuacao_especifica to tenants
-- Stores the specific sub-categories of the  
-- tenant's main_module (e.g., Hotel, Pousada, etc.)
-- ============================================

-- Add the column
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS atuacao_especifica TEXT[] DEFAULT '{}';

-- Add a comment for documentation
COMMENT ON COLUMN tenants.atuacao_especifica IS 
  'Specific sub-categories within the main_module (e.g., hotel, pousada, casa, apartamento). Selected during onboarding Step 3.';

-- Update RLS policies if needed (tenants already have proper RLS)
-- No changes needed - existing policies already cover this column.
