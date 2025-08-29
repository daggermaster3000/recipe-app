-- Add JSONB column to store rich step items with optional image URLs
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS step_items jsonb DEFAULT '[]'::jsonb;

-- Note: keep legacy text[] `steps` for backward compatibility


