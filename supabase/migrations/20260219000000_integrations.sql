-- Create integrations table
create table if not exists public.integrations (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    provider text not null, -- e.g., 'telegram', 'openai', 'whatsapp'
    credentials jsonb default '{}'::jsonb, -- encrypted tokens or keys
    enabled boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(project_id, provider)
);

-- Enable RLS
alter table public.integrations enable row level security;

-- Policies

-- Users can view integrations for projects they own
create policy "Users can view integrations for their projects"
    on public.integrations for select
    using (
        exists (
            select 1 from public.projects
            where projects.id = integrations.project_id
            and projects.owner_id = auth.uid()
        )
    );

-- Users can insert/update integrations for projects they own
create policy "Users can manage integrations for their projects"
    on public.integrations for all
    using (
        exists (
            select 1 from public.projects
            where projects.id = integrations.project_id
            and projects.owner_id = auth.uid()
        )
    );

-- Indexes
create index idx_integrations_project_id on public.integrations(project_id);
