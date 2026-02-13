-- Create a table for public profiles (optional but recommended)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create projects table
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  owner_id uuid references auth.users not null,
  status text default 'active' check (status in ('active', 'inactive', 'archived'))
);

alter table public.projects enable row level security;

create policy "Users can view projects they own"
  on public.projects for select
  using ( auth.uid() = owner_id );

create policy "Users can create projects"
  on public.projects for insert
  with check ( auth.uid() = owner_id );

create policy "Users can update projects they own"
  on public.projects for update
  using ( auth.uid() = owner_id );

create policy "Users can delete projects they own"
  on public.projects for delete
  using ( auth.uid() = owner_id );

-- Function to handle new user signup (automatically create profile)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
