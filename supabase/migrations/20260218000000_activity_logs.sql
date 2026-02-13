-- Create activity_logs table
create table if not exists public.activity_logs (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete set null, -- Nullable for system events
    action_type text not null, -- e.g., 'login', 'update_project', 'delete_bot'
    description text,
    metadata jsonb default '{}'::jsonb,
    ip_address text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.activity_logs enable row level security;

-- Policies

-- Users can view logs for projects they own
create policy "Users can view activity logs for their projects"
    on public.activity_logs for select
    using (
        exists (
            select 1 from public.projects
            where projects.id = activity_logs.project_id
            and projects.owner_id = auth.uid()
        )
    );

-- Users can insert logs for projects they own (or have access to)
-- This allows the app to log actions performed by the user
create policy "Users can insert activity logs for their projects"
    on public.activity_logs for insert
    with check (
        exists (
            select 1 from public.projects
            where projects.id = project_id
            and projects.owner_id = auth.uid()
        )
    );

-- Indexes for filtering and sorting
create index idx_activity_logs_project_id on public.activity_logs(project_id);
create index idx_activity_logs_created_at on public.activity_logs(created_at);
create index idx_activity_logs_user_id on public.activity_logs(user_id);
create index idx_activity_logs_action_type on public.activity_logs(action_type);
