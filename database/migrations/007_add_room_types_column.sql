-- Migration: Add room_types column to suppliers table
-- This allows storing dynamic room types as JSON array

ALTER TABLE suppliers 
ADD COLUMN room_types JSONB DEFAULT '["Standard Room", "Deluxe Room", "Suite"]';

-- Add comment to document the column
COMMENT ON COLUMN suppliers.room_types IS 'Array of room type names for dynamic room rates management'; 