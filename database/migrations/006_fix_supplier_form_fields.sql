-- ============================================================================
-- MIGRATION: Fix Supplier Form Fields
-- File: 006_fix_supplier_form_fields.sql
-- Description: Adds missing fields for supplier form and fixes schema issues
-- ============================================================================

-- Add missing location field to suppliers table
ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- Add missing property_name field (if needed for future use)
ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS property_name VARCHAR(255);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_suppliers_location ON suppliers(location);
CREATE INDEX IF NOT EXISTS idx_suppliers_property_name ON suppliers(property_name);

-- Update supplier_type check constraint to include all types
ALTER TABLE suppliers DROP CONSTRAINT IF EXISTS suppliers_supplier_type_check;
ALTER TABLE suppliers ADD CONSTRAINT suppliers_supplier_type_check 
    CHECK (supplier_type IN ('transport', 'logistics', 'tour', 'rental', 'hotel', 'land_transfer', 'hotels'));

-- Add comments to document the new fields
COMMENT ON COLUMN suppliers.location IS 'Supplier location/address';
COMMENT ON COLUMN suppliers.property_name IS 'Property name for hotel suppliers';

-- Ensure all required fields have proper defaults
ALTER TABLE suppliers 
ALTER COLUMN supplier_type SET DEFAULT 'transport',
ALTER COLUMN account_status SET DEFAULT 'pending',
ALTER COLUMN overall_rating SET DEFAULT 0.0,
ALTER COLUMN total_trips_completed SET DEFAULT 0,
ALTER COLUMN total_revenue_generated SET DEFAULT 0.0,
ALTER COLUMN on_time_percentage SET DEFAULT 0.0;

-- Add any missing constraints
ALTER TABLE suppliers 
ALTER COLUMN supplier_code SET NOT NULL,
ALTER COLUMN company_id SET NOT NULL;

-- Update existing records to have proper defaults if needed
UPDATE suppliers 
SET 
    location = COALESCE(location, 'N/A'),
    property_name = COALESCE(property_name, 'N/A')
WHERE location IS NULL OR property_name IS NULL; 