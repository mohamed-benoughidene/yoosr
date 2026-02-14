-- Create labels table
create table if not exists public.labels (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    name text not null,
    color text not null default 'blue' check (color in ('red', 'orange', 'yellow', 'green', 'blue', 'violet')),
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.labels enable row level security;

create policy "Users can view labels for their projects"
    on public.labels for select
    using (
        exists (
            select 1 from public.projects
            where projects.id = labels.project_id
            and projects.owner_id = auth.uid()
        )
    );

create policy "Users can manage labels for their projects"
    on public.labels for all
    using (
        exists (
            select 1 from public.projects
            where projects.id = labels.project_id
            and projects.owner_id = auth.uid()
        )
    );

create index if not exists idx_labels_project_id on public.labels(project_id);
