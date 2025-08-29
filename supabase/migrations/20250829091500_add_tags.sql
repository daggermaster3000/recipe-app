-- Add tags column to recipes
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

