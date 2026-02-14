-- Add webhook columns to projects table
alter table public.projects
  add column if not exists webhook_url text default '',
  add column if not exists webhook_enabled boolean default false;

-- Notify PostgREST to reload schema
notify pgrst, 'reload schema';
