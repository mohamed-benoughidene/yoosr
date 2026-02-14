-- Create project_members table
create table if not exists public.project_members (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade,
    role text not null default 'agent' check (role in ('owner', 'administrator', 'agent')),
    status text not null default 'available' check (status in ('available', 'unavailable')),
    invited_email text,
    invited_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(project_id, user_id)
);

-- Enable RLS
alter table public.project_members enable row level security;

-- Policies
create policy "Members can view members of their projects"
    on public.project_members for select
    using (
        exists (
            select 1 from public.project_members pm
            where pm.project_id = project_members.project_id
            and pm.user_id = auth.uid()
        )
        or
        exists (
            select 1 from public.projects
            where projects.id = project_members.project_id
            and projects.owner_id = auth.uid()
        )
    );

create policy "Project owners can manage members"
    on public.project_members for all
    using (
        exists (
            select 1 from public.projects
            where projects.id = project_members.project_id
            and projects.owner_id = auth.uid()
        )
    );

create policy "Members can update their own status"
    on public.project_members for update
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

-- Indexes
create index if not exists idx_project_members_project_id on public.project_members(project_id);
create index if not exists idx_project_members_user_id on public.project_members(user_id);
