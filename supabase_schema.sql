-- --- Supabase Database Schema for Nandi Invites ---

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: memory_pages
create table if not exists public.memory_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  slug text unique not null,
  occasion text not null,
  recipient text not null,
  from_name text not null,
  date date not null,
  theme_id text not null,
  wishes text[] default '{}',
  image_urls text[] default '{}',
  audio_urls text[] default '{}',
  video_urls text[] default '{}',
  created_at timestamptz default now()
);

-- Table: guests
create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  memory_page_id uuid references public.memory_pages(id) on delete cascade,
  first_name text not null,
  last_name text,
  email text,
  phone text,
  rsvp_status text default 'pending' check (rsvp_status in ('pending', 'attending', 'declined')),
  created_at timestamptz default now()
);

-- Table: contributions
create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  memory_page_id uuid references public.memory_pages(id) on delete cascade,
  contributor_id uuid references auth.users(id) on delete set null,
  contributor_name text not null,
  contributor_avatar_color text not null, -- Hex color assigned at first contribution
  type text not null check (type in ('wish', 'photo', 'audio', 'video')),
  content_text text,
  media_urls text[] default '{}',
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);

-- Table: reactions
create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  contribution_id uuid references public.contributions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  type text not null check (type in ('heart', 'clap', 'hug')),
  created_at timestamptz default now(),
  unique (contribution_id, user_id, type)
);

-- Table: replies
create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  contribution_id uuid references public.contributions(id) on delete cascade,
  author_id uuid references auth.users(id) on delete cascade,
  author_name text not null,
  content_text text not null,
  created_at timestamptz default now()
);

-- Table: page_settings
create table if not exists public.page_settings (
  id uuid primary key default gen_random_uuid(),
  memory_page_id uuid references public.memory_pages(id) on delete cascade unique,
  contribution_mode text default 'open' check (contribution_mode in ('open', 'guests', 'closed')),
  auto_approve boolean default false,
  pinned_contribution_ids uuid[] default '{}',
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- --- Enable Row Level Security (RLS) ---
alter table public.memory_pages enable row level security;
alter table public.guests enable row level security;
alter table public.contributions enable row level security;
alter table public.reactions enable row level security;
alter table public.replies enable row level security;
alter table public.page_settings enable row level security;

-- --- RLS Policies ---

-- memory_pages policies
create policy "Allow public read access to memory pages" on public.memory_pages
  for select using (true);
create policy "Allow authenticated user insert memory pages" on public.memory_pages
  for insert with check (auth.uid() = user_id);
create policy "Allow owner update/delete memory pages" on public.memory_pages
  for all using (auth.uid() = user_id);

-- guests policies
create policy "Allow public read access to guests" on public.guests
  for select using (true);
create policy "Allow public update guest rsvp (identified by gid)" on public.guests
  for update using (true) with check (true);
create policy "Allow memory page owner full access to guests" on public.guests
  for all using (
    auth.uid() in (select user_id from public.memory_pages where id = memory_page_id)
  );

-- contributions policies
create policy "Allow public read access to approved contributions" on public.contributions
  for select using (
    status = 'approved' 
    or auth.uid() = contributor_id 
    or auth.uid() in (select user_id from public.memory_pages where id = memory_page_id)
  );
create policy "Allow authenticated user insert contributions" on public.contributions
  for insert with check (auth.role() = 'authenticated');
create policy "Allow contributor or owner update contributions" on public.contributions
  for update using (
    auth.uid() = contributor_id 
    or auth.uid() in (select user_id from public.memory_pages where id = memory_page_id)
  );
create policy "Allow contributor or owner delete contributions" on public.contributions
  for delete using (
    auth.uid() = contributor_id 
    or auth.uid() in (select user_id from public.memory_pages where id = memory_page_id)
  );

-- reactions policies
create policy "Allow public select reactions" on public.reactions
  for select using (true);
create policy "Allow authenticated insert reactions" on public.reactions
  for insert with check (auth.role() = 'authenticated');
create policy "Allow users to delete own reactions" on public.reactions
  for delete using (auth.uid() = user_id);

-- replies policies
create policy "Allow public select replies" on public.replies
  for select using (true);
create policy "Allow authenticated insert replies" on public.replies
  for insert with check (auth.role() = 'authenticated');
create policy "Allow author delete own replies" on public.replies
  for delete using (auth.uid() = author_id);

-- page_settings policies
create policy "Allow public select page_settings" on public.page_settings
  for select using (true);
create policy "Allow owner update page_settings" on public.page_settings
  for all using (
    auth.uid() in (select user_id from public.memory_pages where id = memory_page_id)
  );

-- --- Enable Realtime ---
-- This script enables realtime for contributions, reactions, and replies.
-- Note: Make sure to add these tables to the 'supabase_realtime' publication via the Supabase UI
-- or run the following to add them:
alter publication supabase_realtime add table public.contributions;
alter publication supabase_realtime add table public.reactions;
alter publication supabase_realtime add table public.replies;
