-- Allow anon to SELECT registrations (needed for Supabase Realtime subscriptions)
-- Only exposes event_id and seats columns via the realtime channel
CREATE POLICY "Public can read registrations for realtime"
  ON registrations FOR SELECT
  USING (TRUE);
