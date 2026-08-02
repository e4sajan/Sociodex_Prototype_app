-- --- Supabase Database Schema & RLS Policies for SocioDex ---

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
  creator_email text,
  date date not null,
  theme_id text not null,
  wishes text[] default '{}',
  image_urls text[] default '{}',
  audio_urls text[] default '{}',
  video_urls text[] default '{}',
  created_at timestamptz default now()
);

-- Table: page_roles
create table if not exists public.page_roles (
  id uuid primary key default gen_random_uuid(),
  memory_page_id uuid references public.memory_pages(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('creator', 'admin', 'contributor', 'follower')),
  created_at timestamptz default now(),
  unique (memory_page_id, user_id)
);

-- Helper RLS function to check user role
create or replace function public.get_page_role(p_memory_page_id uuid, p_user_id uuid)
returns text language plpgsql security definer as $$
declare
  v_role text;
begin
  select role into v_role from public.page_roles
  where memory_page_id = p_memory_page_id and user_id = p_user_id;
  
  if v_role is not null then
    return v_role;
  end if;

  if exists (select 1 from public.memory_pages where id = p_memory_page_id and user_id = p_user_id) then
    return 'creator';
  end if;

  return 'visitor';
end;
$$;

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
  contributor_avatar_color text not null,
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
alter table public.page_roles enable row level security;
alter table public.guests enable row level security;
alter table public.contributions enable row level security;
alter table public.reactions enable row level security;
alter table public.replies enable row level security;
alter table public.page_settings enable row level security;

-- --- RLS Policies matching Official Permission Matrix ---

-- 1. memory_pages: Only Creator can delete or update page title/theme/reveal date
create policy "Allow public view pages" on public.memory_pages for select using (true);
create policy "Allow auth insert page" on public.memory_pages for insert with check (auth.uid() = user_id);
create policy "Allow Creator edit or delete page" on public.memory_pages for all using (
  auth.uid() = user_id or public.get_page_role(id, auth.uid()) = 'creator'
);

-- 2. page_roles: Only Creator can assign or remove admins
create policy "Allow view roles" on public.page_roles for select using (true);
create policy "Allow Creator manage roles" on public.page_roles for all using (
  public.get_page_role(memory_page_id, auth.uid()) = 'creator'
);

-- 3. contributions: Creator/Admin can remove any; Creator/Admin/Contributor can insert & edit own within 24h
create policy "Allow public select contributions" on public.contributions for select using (true);
create policy "Allow Creator, Admin, Contributor add contribution" on public.contributions for insert with check (
  public.get_page_role(memory_page_id, auth.uid()) in ('creator', 'admin', 'contributor')
);
create policy "Allow Contributor edit own (within 24h) or Creator/Admin manage" on public.contributions for update using (
  (auth.uid() = contributor_id and created_at >= (now() - interval '24 hours'))
  or public.get_page_role(memory_page_id, auth.uid()) in ('creator', 'admin')
);
create policy "Allow Contributor delete own or Creator/Admin remove any contribution" on public.contributions for delete using (
  auth.uid() = contributor_id
  or public.get_page_role(memory_page_id, auth.uid()) in ('creator', 'admin')
);

-- 4. reactions: Creator, Admin, Contributor, & Follower can react
create policy "Allow public view reactions" on public.reactions for select using (true);
create policy "Allow Creator, Admin, Contributor, Follower react" on public.reactions for insert with check (
  auth.role() = 'authenticated'
);
create policy "Allow delete own reaction" on public.reactions for delete using (auth.uid() = user_id);

-- 5. page_settings: Only Creator & Admin can edit settings/PIN
create policy "Allow view settings" on public.page_settings for select using (true);
create policy "Allow Creator and Admin update settings" on public.page_settings for all using (
  public.get_page_role(memory_page_id, auth.uid()) in ('creator', 'admin')
);

-- --- Enable Realtime ---
alter publication supabase_realtime add table public.contributions;
alter publication supabase_realtime add table public.reactions;
alter publication supabase_realtime add table public.replies;
