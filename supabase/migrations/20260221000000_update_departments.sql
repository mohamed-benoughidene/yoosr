-- Add routing_mode and bot_id to departments table
alter table public.departments
add column if not exists routing_mode text default 'pooled' check (routing_mode in ('assigned', 'pooled')),
add column if not exists bot_id uuid references public.bots(id) on delete set null;

-- Add index on bot_id for performance
create index if not exists idx_departments_bot_id on public.departments(bot_id);
