-- Migration: Fix education_history enrollment_logic constraint
-- Date: 2025-10-15
-- Description: Update constraint to allow future dates for currently enrolled students
--              and set end_date to NULL for ongoing education

-- Drop the existing constraint
ALTER TABLE education_history DROP CONSTRAINT IF EXISTS enrollment_logic;

-- Add the updated constraint
-- Logic:
-- - If currently_enrolled = TRUE: end_date must be NULL or in the future
-- - If currently_enrolled = FALSE: end_date must be NULL or in the past/present
ALTER TABLE education_history ADD CONSTRAINT enrollment_logic CHECK (
    (currently_enrolled = TRUE AND (end_date IS NULL OR end_date > CURRENT_DATE)) OR 
    (currently_enrolled = FALSE AND (end_date IS NULL OR end_date <= CURRENT_DATE))
);

-- Update any existing records where currently_enrolled = TRUE but end_date is set
-- Set end_date to NULL for these records to comply with the new constraint
UPDATE education_history 
SET end_date = NULL 
WHERE currently_enrolled = TRUE AND end_date IS NOT NULL;
