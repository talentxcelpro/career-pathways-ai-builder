-- Rollback posts RLS and reshare changes
BEGIN;

CREATE POLICY "Own records update"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (auth.uid() IS NOT NULL);

COMMIT;
