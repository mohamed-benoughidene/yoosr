-- Add widget_config to projects
alter table public.projects
add column if not exists widget_config jsonb default '{}'::jsonb;

-- Create departments table
create table if not exists public.departments (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    name text not null,
    description text,
    is_default boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for departments
alter table public.departments enable row level security;

-- Policies for departments
create policy "Users can view departments for their projects"
    on public.departments for select
    using (
        exists (
            select 1 from public.projects
            where projects.id = departments.project_id
            and projects.owner_id = auth.uid()
        )
    );

create policy "Users can manage departments for their projects"
    on public.departments for all
    using (
        exists (
            select 1 from public.projects
            where projects.id = departments.project_id
            and projects.owner_id = auth.uid()
        )
    );

-- Create canned_responses table
create table if not exists public.canned_responses (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    trigger text not null,
    message text not null,
    created_by uuid references auth.users, 
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for canned_responses
alter table public.canned_responses enable row level security;

-- Policies for canned_responses
create policy "Users can view canned responses for their projects"
    on public.canned_responses for select
    using (
        exists (
            select 1 from public.projects
            where projects.id = canned_responses.project_id
            and projects.owner_id = auth.uid()
        )
    );

create policy "Users can manage canned responses for their projects"
    on public.canned_responses for all
    using (
        exists (
            select 1 from public.projects
            where projects.id = canned_responses.project_id
            and projects.owner_id = auth.uid()
        )
    );

-- Indexes
create index if not exists idx_departments_project_id on public.departments(project_id);
create index if not exists idx_canned_responses_project_id on public.canned_responses(project_id);
