-- Create bots table
create table if not exists public.bots (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    project_id uuid references public.projects(id) on delete cascade not null,
    name text not null,
    description text,
    type text check (type in ('chatbot', 'automation')) not null,
    status text default 'draft' check (status in ('draft', 'active', 'archived')),
    configuration jsonb default '{}'::jsonb -- Stores the flow definition
);

-- Enable RLS
alter table public.bots enable row level security;

-- Policies for Bots
create policy "Users can view bots for their projects"
    on public.bots for select
    using (
        exists (
            select 1 from public.projects
            where projects.id = bots.project_id
            and projects.owner_id = auth.uid()
        )
    );

create policy "Users can insert bots for their projects"
    on public.bots for insert
    with check (
        exists (
            select 1 from public.projects
            where projects.id = bots.project_id
            and projects.owner_id = auth.uid()
        )
    );

create policy "Users can update bots for their projects"
    on public.bots for update
    using (
        exists (
            select 1 from public.projects
            where projects.id = bots.project_id
            and projects.owner_id = auth.uid()
        )
    );

create policy "Users can delete bots for their projects"
    on public.bots for delete
    using (
        exists (
            select 1 from public.projects
            where projects.id = bots.project_id
            and projects.owner_id = auth.uid()
        )
    );
