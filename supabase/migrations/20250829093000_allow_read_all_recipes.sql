-- Allow authenticated users to view all recipes (for Explore feed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'recipes'
      AND policyname = 'Authenticated users can view all recipes'
  ) THEN
    CREATE POLICY "Authenticated users can view all recipes"
      ON recipes
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

