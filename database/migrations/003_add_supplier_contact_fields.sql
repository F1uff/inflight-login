-- ============================================================================
-- ADD SUPPLIER CONTACT FIELDS MIGRATION
-- Migration: 003_add_supplier_contact_fields.sql
-- Description: Add contact and business fields to suppliers table for frontend updates
-- ============================================================================

-- Add contact and business fields to suppliers table
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS representative_name VARCHAR(255);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS designation VARCHAR(100);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS tel_number VARCHAR(50);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS breakfast_type VARCHAR(100);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS room_quantity INTEGER;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS mode_of_payment VARCHAR(100);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS credit_terms VARCHAR(100);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS remarks TEXT;

-- Add indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_suppliers_representative_name ON suppliers(representative_name);
CREATE INDEX IF NOT EXISTS idx_suppliers_designation ON suppliers(designation);
CREATE INDEX IF NOT EXISTS idx_suppliers_tel_number ON suppliers(tel_number);
CREATE INDEX IF NOT EXISTS idx_suppliers_breakfast_type ON suppliers(breakfast_type);
CREATE INDEX IF NOT EXISTS idx_suppliers_mode_of_payment ON suppliers(mode_of_payment);
CREATE INDEX IF NOT EXISTS idx_suppliers_credit_terms ON suppliers(credit_terms);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================ 