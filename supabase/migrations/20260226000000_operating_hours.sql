-- Create operating_hours table
create table if not exists public.operating_hours (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    enabled boolean default false not null,
    timezone text default 'UTC' not null,
    schedule jsonb default '[
        {"day": "sunday", "open": false, "slots": []},
        {"day": "monday", "open": true, "slots": [{"start": "09:00", "end": "17:00"}]},
        {"day": "tuesday", "open": true, "slots": [{"start": "09:00", "end": "17:00"}]},
        {"day": "wednesday", "open": true, "slots": [{"start": "09:00", "end": "17:00"}]},
        {"day": "thursday", "open": true, "slots": [{"start": "09:00", "end": "17:00"}]},
        {"day": "friday", "open": true, "slots": [{"start": "09:00", "end": "17:00"}]},
        {"day": "saturday", "open": false, "slots": []}
    ]'::jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(project_id)
);

alter table public.operating_hours enable row level security;

create policy "Users can view operating hours for their projects"
    on public.operating_hours for select
    using (
        exists (
            select 1 from public.projects
            where projects.id = operating_hours.project_id
            and projects.owner_id = auth.uid()
        )
    );

create policy "Users can manage operating hours for their projects"
    on public.operating_hours for all
    using (
        exists (
            select 1 from public.projects
            where projects.id = operating_hours.project_id
            and projects.owner_id = auth.uid()
        )
    );

create index if not exists idx_operating_hours_project_id on public.operating_hours(project_id);
