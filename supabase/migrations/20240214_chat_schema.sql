-- Create conversations table
create table if not exists public.conversations (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    project_id uuid references public.projects(id) on delete cascade not null,
    status text default 'open' check (status in ('open', 'closed', 'archived')),
    assigned_to uuid references auth.users(id),
    visitor_id text, -- Temporary identifier for visitors until we have a full visitor table
    visitor_name text,
    last_message text,
    unread_count integer default 0
);

-- Create messages table
create table if not exists public.messages (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    conversation_id uuid references public.conversations(id) on delete cascade not null,
    sender_type text check (sender_type in ('user', 'visitor', 'bot')) not null,
    sender_id uuid references auth.users(id), -- Nullable if sender is visitor
    content text not null,
    attachments jsonb -- Array of file URLs/metadata
);

-- Enable RLS
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Policies for Conversations
-- Users can view conversations for projects they own
create policy "Users can view conversations for their projects"
    on public.conversations for select
    using (
        exists (
            select 1 from public.projects
            where projects.id = conversations.project_id
            and projects.owner_id = auth.uid()
        )
    );

-- Users can insert conversations (e.g., simulating a visitor or starting internal chat)
-- For now, allow authenticated users to create conversations in projects they own
create policy "Users can create conversations in their projects"
    on public.conversations for insert
    with check (
        exists (
            select 1 from public.projects
            where projects.id = project_id
            and projects.owner_id = auth.uid()
        )
    );

-- Users can update conversations (e.g., assigning, closing)
create policy "Users can update conversations in their projects"
    on public.conversations for update
    using (
        exists (
            select 1 from public.projects
            where projects.id = project_id
            and projects.owner_id = auth.uid()
        )
    );

-- Policies for Messages
-- Users can view messages for conversations they have access to
create policy "Users can view messages in their conversations"
    on public.messages for select
    using (
        exists (
            select 1 from public.conversations
            join public.projects on projects.id = conversations.project_id
            where conversations.id = messages.conversation_id
            and projects.owner_id = auth.uid()
        )
    );

-- Users can insert messages into conversations they have access to
create policy "Users can send messages in their conversations"
    on public.messages for insert
    with check (
        exists (
            select 1 from public.conversations
            join public.projects on projects.id = conversations.project_id
            where conversations.id = messages.conversation_id
            and projects.owner_id = auth.uid()
        )
    );

-- Indexes for performance
create index idx_conversations_project_id on public.conversations(project_id);
create index idx_messages_conversation_id on public.messages(conversation_id);
