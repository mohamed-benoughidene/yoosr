-- Add tables to the supabase_realtime publication to enable listening to changes
begin;
  -- Remove first to avoid "already exists" error if we want to be safe, or just try add.
  -- Postgres doesn't have "ADD TABLE IF NOT EXISTS" for publications easily.
  -- But usually `alter publication ... add table` is fine. 
  -- However, to be safe and idempotent:
  
  do $$
  begin
    if not exists (
      select 1 from pg_publication_tables 
      where pubname = 'supabase_realtime' 
      and schemaname = 'public' 
      and tablename = 'messages'
    ) then
      alter publication supabase_realtime add table public.messages;
    end if;

    if not exists (
      select 1 from pg_publication_tables 
      where pubname = 'supabase_realtime' 
      and schemaname = 'public' 
      and tablename = 'conversations'
    ) then
      alter publication supabase_realtime add table public.conversations;
    end if;
  end;
  $$;
commit;
