-- ============================================================================
-- MIGRATION: Add Hotel Supplier Fields
-- File: 004_add_hotel_supplier_fields.sql
-- Description: Adds hotel-specific fields to suppliers table
-- ============================================================================

-- Add hotel-specific fields to suppliers table
ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS frontdesk_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS frontdesk_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS security_deposit VARCHAR(100),
ADD COLUMN IF NOT EXISTS representative_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS designation VARCHAR(100),
ADD COLUMN IF NOT EXISTS tel_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS breakfast_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS room_quantity INTEGER,
ADD COLUMN IF NOT EXISTS mode_of_payment VARCHAR(50),
ADD COLUMN IF NOT EXISTS credit_terms VARCHAR(50),
ADD COLUMN IF NOT EXISTS remarks TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_suppliers_frontdesk_phone ON suppliers(frontdesk_phone);
CREATE INDEX IF NOT EXISTS idx_suppliers_frontdesk_email ON suppliers(frontdesk_email);
CREATE INDEX IF NOT EXISTS idx_suppliers_breakfast_type ON suppliers(breakfast_type);
CREATE INDEX IF NOT EXISTS idx_suppliers_mode_of_payment ON suppliers(mode_of_payment);

-- Update supplier_type check constraint to include 'hotel'
ALTER TABLE suppliers DROP CONSTRAINT IF EXISTS suppliers_supplier_type_check;
ALTER TABLE suppliers ADD CONSTRAINT suppliers_supplier_type_check 
    CHECK (supplier_type IN ('transport', 'logistics', 'tour', 'rental', 'hotel', 'land_transfer'));

-- Add comment to document the new fields
COMMENT ON COLUMN suppliers.frontdesk_phone IS 'Hotel frontdesk contact number';
COMMENT ON COLUMN suppliers.frontdesk_email IS 'Hotel frontdesk email address';
COMMENT ON COLUMN suppliers.security_deposit IS 'Hotel security deposit amount';
COMMENT ON COLUMN suppliers.representative_name IS 'Company representative name';
COMMENT ON COLUMN suppliers.designation IS 'Representative designation';
COMMENT ON COLUMN suppliers.tel_number IS 'Telephone number';
COMMENT ON COLUMN suppliers.breakfast_type IS 'Type of breakfast offered';
COMMENT ON COLUMN suppliers.room_quantity IS 'Number of rooms available';
COMMENT ON COLUMN suppliers.mode_of_payment IS 'Payment mode (cash, check, bank_transfer, credit_card)';
COMMENT ON COLUMN suppliers.credit_terms IS 'Credit terms (immediate, 7_days, 15_days, 30_days, 60_days)';
COMMENT ON COLUMN suppliers.remarks IS 'Additional remarks or notes'; 