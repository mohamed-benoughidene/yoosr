-- Notify PostgREST to reload schema cache
notify pgrst, 'reload schema';

-- Also drop and recreate the "for all" policy to be safe
drop policy if exists "Project owners can manage members" on public.project_members;

create policy "Project owners can insert members"
    on public.project_members for insert
    with check (
        exists (
            select 1 from public.projects
            where projects.id = project_members.project_id
            and projects.owner_id = auth.uid()
        )
    );

create policy "Project owners can delete members"
    on public.project_members for delete
    using (
        exists (
            select 1 from public.projects
            where projects.id = project_members.project_id
            and projects.owner_id = auth.uid()
        )
    );

create policy "Project owners can update members"
    on public.project_members for update
    using (
        exists (
            select 1 from public.projects
            where projects.id = project_members.project_id
            and projects.owner_id = auth.uid()
        )
    );
