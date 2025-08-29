-- Add author fields to recipes
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS author_id uuid,
ADD COLUMN IF NOT EXISTS author_name text;

-- Optionally backfill existing rows with user_id as author_id
UPDATE recipes SET author_id = user_id WHERE author_id IS NULL;

