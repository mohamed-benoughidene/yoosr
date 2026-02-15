-- Allow authenticated users to view messages (Fix for Realtime JOIN limitation)
-- The existing policy "Users can view messages in their conversations" uses a JOIN 
-- which effectively blocks Realtime events for authenticated users because Realtime 
-- cannot efficiently evaluate JOINs in RLS for every event.
create policy "Authenticated users can view messages (Realtime Fix)"
    on public.messages for select
    to authenticated
    using (true);

-- Allow authenticated users to view conversations (Fix for Realtime JOIN limitation)
create policy "Authenticated users can view conversations (Realtime Fix)"
    on public.conversations for select
    to authenticated
    using (true);
