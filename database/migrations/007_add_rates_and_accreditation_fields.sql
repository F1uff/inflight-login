-- ============================================================================
-- MIGRATION: Add Rates and Accreditation Fields
-- File: 007_add_rates_and_accreditation_fields.sql
-- Description: Adds missing fields for hotel supplier rates and accreditation
-- ============================================================================

-- Add missing fields to suppliers table
ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS contracted_rates_date DATE;

ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS corporate_rates_date DATE;

ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS accreditation VARCHAR(50);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_suppliers_contracted_rates_date ON suppliers(contracted_rates_date);
CREATE INDEX IF NOT EXISTS idx_suppliers_corporate_rates_date ON suppliers(corporate_rates_date);
CREATE INDEX IF NOT EXISTS idx_suppliers_accreditation ON suppliers(accreditation);

-- Add comments to document the new fields
COMMENT ON COLUMN suppliers.contracted_rates_date IS 'Date for contracted rates validity';
COMMENT ON COLUMN suppliers.corporate_rates_date IS 'Date for corporate rates validity';
COMMENT ON COLUMN suppliers.accreditation IS 'Accreditation status of the supplier';

-- Add check constraint for accreditation values
ALTER TABLE suppliers DROP CONSTRAINT IF EXISTS suppliers_accreditation_check;
ALTER TABLE suppliers ADD CONSTRAINT suppliers_accreditation_check 
    CHECK (accreditation IN ('accredited_dir', 'accredited', 'non_accredited_inn', 'non_accredited', 'on_process') OR accreditation IS NULL);

-- Update existing records to have proper defaults if needed
UPDATE suppliers 
SET 
    contracted_rates_date = NULL,
    corporate_rates_date = NULL,
    accreditation = NULL
WHERE contracted_rates_date IS NULL AND corporate_rates_date IS NULL AND accreditation IS NULL; 