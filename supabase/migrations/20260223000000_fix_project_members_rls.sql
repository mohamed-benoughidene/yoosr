-- Fix RLS infinite recursion: drop old self-referencing select policy and replace

-- Drop the old policies
drop policy if exists "Members can view members of their projects" on public.project_members;
drop policy if exists "Members can update their own status" on public.project_members;

-- New select policy: project owner can view all members, 
-- and members can view other members (checked via projects owner_id to avoid recursion)
create policy "Project owners and members can view members"
    on public.project_members for select
    using (
        -- Project owner can see all members
        exists (
            select 1 from public.projects
            where projects.id = project_members.project_id
            and projects.owner_id = auth.uid()
        )
        or
        -- The member themselves can see their own row
        user_id = auth.uid()
    );

-- Members can update their own status (separate policy for UPDATE only)
create policy "Members can update own status"
    on public.project_members for update
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
