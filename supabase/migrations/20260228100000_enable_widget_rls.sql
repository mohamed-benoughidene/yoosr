-- Enable RLS for anon visitors (Guests)

-- Allow visitors to insert conversations
create policy "Visitors can create conversations"
    on public.conversations for insert
    to anon
    with check (true);

-- Allow visitors to view conversations (Simplified for MVP - revisit for security)
create policy "Visitors can view conversations"
    on public.conversations for select
    to anon
    using (true);

-- Allow visitors to insert messages
create policy "Visitors can insert messages"
    on public.messages for insert
    to anon
    with check (true);

-- Allow visitors to view messages
create policy "Visitors can view messages"
    on public.messages for select
    to anon
    using (true);
