-- ==============================================================================
-- COMPLETE SUPABASE BACKEND SCHEMA FOR SOCIODEX & SOCIAL MEDIA APPLICATION
-- Features: Auth & User Profiles, Memory Pages, Posts, Comments, Likes, Follows, Notifications, DMs
-- Includes: Security Definer Helper Functions, RLS Security Policies, Automated Triggers, Realtime
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. PROFILES TABLE (Linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (char_length(username) >= 3),
  full_name text not null,
  avatar_url text,
  bio text default '',
  website text default '',
  is_private boolean default false,
  is_verified boolean default false,
  followers_count integer default 0 check (followers_count >= 0),
  following_count integer default 0 check (following_count >= 0),
  posts_count integer default 0 check (posts_count >= 0),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_profiles_username on public.profiles(username);

-- 3. MEMORY PAGES TABLES (SocioDex Keepsakes)
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

-- 4. POSTS TABLE
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text default '',
  media_urls text[] default '{}',
  media_type text default 'text' check (media_type in ('text', 'image', 'video', 'carousel')),
  likes_count integer default 0 check (likes_count >= 0),
  comments_count integer default 0 check (comments_count >= 0),
  shares_count integer default 0 check (shares_count >= 0),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_posts_user_id on public.posts(user_id);
create index if not exists idx_posts_created_at on public.posts(created_at desc);

-- 5. COMMENTS TABLE
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0),
  likes_count integer default 0 check (likes_count >= 0),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_comments_post_id on public.comments(post_id);
create index if not exists idx_comments_parent_id on public.comments(parent_comment_id);

-- 6. LIKES TABLE
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz default now() not null,
  constraint check_like_target check (
    (post_id is not null and comment_id is null) or
    (post_id is null and comment_id is not null)
  )
);

create unique index if not exists unique_user_post_like on public.likes (user_id, post_id) where post_id is not null;
create unique index if not exists unique_user_comment_like on public.likes (user_id, comment_id) where comment_id is not null;

-- 7. FOLLOWS TABLE
create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  status text default 'accepted' check (status in ('pending', 'accepted')),
  created_at timestamptz default now() not null,
  primary key (follower_id, following_id),
  constraint check_no_self_follow check (follower_id <> following_id)
);

create index if not exists idx_follows_following on public.follows(following_id);

-- 8. NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('like_post', 'like_comment', 'comment', 'follow', 'follow_request', 'mention', 'direct_message')),
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  message_id uuid,
  is_read boolean default false not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_notifications_recipient on public.notifications(recipient_id, is_read);

-- 9. DIRECT MESSAGES (CONVERSATIONS & MESSAGES)
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  is_group boolean default false not null,
  title text,
  updated_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz default now() not null,
  last_read_at timestamptz default now() not null,
  primary key (conversation_id, user_id)
);

create index if not exists idx_conv_participants_user on public.conversation_participants(user_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text default '',
  media_url text,
  created_at timestamptz default now() not null
);

create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at desc);

-- ==============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Security definer function to bypass RLS recursion on conversation membership
create or replace function public.is_conversation_participant(p_conversation_id uuid, p_user_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  return exists (
    select 1 from public.conversation_participants
    where conversation_id = p_conversation_id and user_id = p_user_id
  );
end;
$$;

-- Auto-create Profile when Auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  raw_username text;
  clean_username text;
begin
  raw_username := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  clean_username := lower(regexp_replace(raw_username, '[^a-zA-Z0-9_]', '', 'g'));
  
  if length(clean_username) < 3 then
    clean_username := clean_username || '_' || substring(new.id::text from 1 for 4);
  end if;

  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    clean_username,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;
  
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Maintain follower/following counts
create or replace function public.update_follow_counts()
returns trigger language plpgsql security definer as $$
begin
  if (TG_OP = 'INSERT' and NEW.status = 'accepted') then
    update public.profiles set following_count = following_count + 1 where id = NEW.follower_id;
    update public.profiles set followers_count = followers_count + 1 where id = NEW.following_id;
  elsif (TG_OP = 'DELETE' and OLD.status = 'accepted') then
    update public.profiles set following_count = greatest(0, following_count - 1) where id = OLD.follower_id;
    update public.profiles set followers_count = greatest(0, followers_count - 1) where id = OLD.following_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trigger_follow_counts on public.follows;
create trigger trigger_follow_counts
  after insert or delete on public.follows
  for each row execute function public.update_follow_counts();

-- Maintain likes_count
create or replace function public.update_like_counts()
returns trigger language plpgsql security definer as $$
begin
  if (TG_OP = 'INSERT') then
    if NEW.post_id is not null then
      update public.posts set likes_count = likes_count + 1 where id = NEW.post_id;
    elsif NEW.comment_id is not null then
      update public.comments set likes_count = likes_count + 1 where id = NEW.comment_id;
    end if;
  elsif (TG_OP = 'DELETE') then
    if OLD.post_id is not null then
      update public.posts set likes_count = greatest(0, likes_count - 1) where id = OLD.post_id;
    elsif OLD.comment_id is not null then
      update public.comments set likes_count = greatest(0, comments_count - 1) where id = OLD.comment_id;
    end if;
  end if;
  return null;
end;
$$;

drop trigger if exists trigger_like_counts on public.likes;
create trigger trigger_like_counts
  after insert or delete on public.likes
  for each row execute function public.update_like_counts();

-- Maintain comments_count and posts_count
create or replace function public.update_comment_counts()
returns trigger language plpgsql security definer as $$
begin
  if (TG_OP = 'INSERT') then
    update public.posts set comments_count = comments_count + 1 where id = NEW.post_id;
  elsif (TG_OP = 'DELETE') then
    update public.posts set comments_count = greatest(0, comments_count - 1) where id = OLD.post_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trigger_comment_counts on public.comments;
create trigger trigger_comment_counts
  after insert or delete on public.comments
  for each row execute function public.update_comment_counts();

create or replace function public.update_user_post_counts()
returns trigger language plpgsql security definer as $$
begin
  if (TG_OP = 'INSERT') then
    update public.profiles set posts_count = posts_count + 1 where id = NEW.user_id;
  elsif (TG_OP = 'DELETE') then
    update public.profiles set posts_count = greatest(0, posts_count - 1) where id = OLD.user_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trigger_user_post_counts on public.posts;
create trigger trigger_user_post_counts
  after insert or delete on public.posts
  for each row execute function public.update_user_post_counts();

-- Auto notifications
create or replace function public.notify_on_like()
returns trigger language plpgsql security definer as $$
declare
  target_user uuid;
begin
  if NEW.post_id is not null then
    select user_id into target_user from public.posts where id = NEW.post_id;
    if target_user is not null and target_user <> NEW.user_id then
      insert into public.notifications (recipient_id, actor_id, type, post_id)
      values (target_user, NEW.user_id, 'like_post', NEW.post_id);
    end if;
  elsif NEW.comment_id is not null then
    select user_id into target_user from public.comments where id = NEW.comment_id;
    if target_user is not null and target_user <> NEW.user_id then
      insert into public.notifications (recipient_id, actor_id, type, comment_id)
      values (target_user, NEW.user_id, 'like_comment', NEW.comment_id);
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trigger_notify_like on public.likes;
create trigger trigger_notify_like
  after insert on public.likes
  for each row execute function public.notify_on_like();

create or replace function public.notify_on_comment()
returns trigger language plpgsql security definer as $$
declare
  target_user uuid;
begin
  select user_id into target_user from public.posts where id = NEW.post_id;
  if target_user is not null and target_user <> NEW.user_id then
    insert into public.notifications (recipient_id, actor_id, type, post_id, comment_id)
    values (target_user, NEW.user_id, 'comment', NEW.post_id, NEW.id);
  end if;
  return NEW;
end;
$$;

drop trigger if exists trigger_notify_comment on public.comments;
create trigger trigger_notify_comment
  after insert on public.comments
  for each row execute function public.notify_on_comment();

create or replace function public.notify_on_follow()
returns trigger language plpgsql security definer as $$
begin
  insert into public.notifications (recipient_id, actor_id, type)
  values (NEW.following_id, NEW.follower_id, case when NEW.status = 'pending' then 'follow_request' else 'follow' end);
  return NEW;
end;
$$;

drop trigger if exists trigger_notify_follow on public.follows;
create trigger trigger_notify_follow
  after insert on public.follows
  for each row execute function public.notify_on_follow();

create or replace function public.update_conversation_timestamp()
returns trigger language plpgsql security definer as $$
begin
  update public.conversations set updated_at = now() where id = NEW.conversation_id;
  return NEW;
end;
$$;

drop trigger if exists trigger_update_conversation on public.messages;
create trigger trigger_update_conversation
  after insert on public.messages
  for each row execute function public.update_conversation_timestamp();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.memory_pages enable row level security;
alter table public.guests enable row level security;
alter table public.contributions enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

-- Drop existing policies if any to prevent conflicts
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

drop policy if exists "Allow public view pages" on public.memory_pages;
drop policy if exists "Allow auth insert page" on public.memory_pages;
drop policy if exists "Allow Creator edit or delete page" on public.memory_pages;

drop policy if exists "Allow public select contributions" on public.contributions;
drop policy if exists "Allow public view guests" on public.guests;

drop policy if exists "Posts are viewable by everyone" on public.posts;
drop policy if exists "Authenticated users can create posts" on public.posts;
drop policy if exists "Users can update own posts" on public.posts;
drop policy if exists "Users can delete own posts" on public.posts;

drop policy if exists "Comments are viewable by everyone" on public.comments;
drop policy if exists "Authenticated users can create comments" on public.comments;
drop policy if exists "Users can update own comments" on public.comments;
drop policy if exists "Users or post owners can delete comments" on public.comments;

drop policy if exists "Likes are viewable by everyone" on public.likes;
drop policy if exists "Authenticated users can toggle likes" on public.likes;
drop policy if exists "Users can remove own likes" on public.likes;

drop policy if exists "Follows viewable by everyone" on public.follows;
drop policy if exists "Authenticated users can create follow relationships" on public.follows;
drop policy if exists "Users can update follow status" on public.follows;
drop policy if exists "Users can delete own follow relationship" on public.follows;

drop policy if exists "Users can view own notifications" on public.notifications;
drop policy if exists "Users can update own notifications read status" on public.notifications;
drop policy if exists "Users can delete own notifications" on public.notifications;

drop policy if exists "Participants can view conversations" on public.conversations;
drop policy if exists "Authenticated users can create conversations" on public.conversations;
drop policy if exists "Participants can view member list" on public.conversation_participants;
drop policy if exists "Users can add self or others to conversation" on public.conversation_participants;
drop policy if exists "Participants can view messages" on public.messages;
drop policy if exists "Participants can send messages" on public.messages;

-- 1. Profiles
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- 2. Memory Pages
create policy "Allow public view pages" on public.memory_pages for select using (true);
create policy "Allow auth insert page" on public.memory_pages for insert with check (auth.uid() = user_id or user_id is null);
create policy "Allow Creator edit or delete page" on public.memory_pages for all using (auth.uid() = user_id);

create policy "Allow public select contributions" on public.contributions for select using (true);
create policy "Allow public insert contributions" on public.contributions for insert with check (true);
create policy "Allow public view guests" on public.guests for select using (true);
create policy "Allow public insert guests" on public.guests for insert with check (true);

-- 3. Posts
create policy "Posts are viewable by everyone" on public.posts
  for select using (true);

create policy "Authenticated users can create posts" on public.posts
  for insert with check (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy "Users can update own posts" on public.posts
  for update using (auth.uid() = user_id);

create policy "Users can delete own posts" on public.posts
  for delete using (auth.uid() = user_id);

-- 4. Comments
create policy "Comments are viewable by everyone" on public.comments
  for select using (true);

create policy "Authenticated users can create comments" on public.comments
  for insert with check (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy "Users can update own comments" on public.comments
  for update using (auth.uid() = user_id);

create policy "Users or post owners can delete comments" on public.comments
  for delete using (
    auth.uid() = user_id or 
    exists (select 1 from public.posts where posts.id = comments.post_id and posts.user_id = auth.uid())
  );

-- 5. Likes
create policy "Likes are viewable by everyone" on public.likes
  for select using (true);

create policy "Authenticated users can toggle likes" on public.likes
  for insert with check (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy "Users can remove own likes" on public.likes
  for delete using (auth.uid() = user_id);

-- 6. Follows
create policy "Follows viewable by everyone" on public.follows
  for select using (true);

create policy "Authenticated users can create follow relationships" on public.follows
  for insert with check (auth.role() = 'authenticated' and auth.uid() = follower_id);

create policy "Users can update follow status" on public.follows
  for update using (auth.uid() = following_id or auth.uid() = follower_id);

create policy "Users can delete own follow relationship" on public.follows
  for delete using (auth.uid() = follower_id or auth.uid() = following_id);

-- 7. Notifications
create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = recipient_id);

create policy "Users can update own notifications read status" on public.notifications
  for update using (auth.uid() = recipient_id);

create policy "Users can delete own notifications" on public.notifications
  for delete using (auth.uid() = recipient_id);

-- 8. Direct Messages (Non-recursive security definer RLS)
create policy "Participants can view conversations" on public.conversations
  for select using (
    public.is_conversation_participant(id, auth.uid())
  );

create policy "Authenticated users can create conversations" on public.conversations
  for insert with check (auth.role() = 'authenticated');

create policy "Participants can view member list" on public.conversation_participants
  for select using (
    user_id = auth.uid() or public.is_conversation_participant(conversation_id, auth.uid())
  );

create policy "Users can add self or others to conversation" on public.conversation_participants
  for insert with check (auth.role() = 'authenticated');

create policy "Participants can view messages" on public.messages
  for select using (
    public.is_conversation_participant(conversation_id, auth.uid())
  );

create policy "Participants can send messages" on public.messages
  for insert with check (
    auth.role() = 'authenticated' and 
    auth.uid() = sender_id and
    public.is_conversation_participant(conversation_id, auth.uid())
  );

-- ==============================================================================
-- REALTIME SUBSCRIPTIONS
-- ==============================================================================
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'posts') then
    alter publication supabase_realtime add table public.posts;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'comments') then
    alter publication supabase_realtime add table public.comments;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'likes') then
    alter publication supabase_realtime add table public.likes;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'memory_pages') then
    alter publication supabase_realtime add table public.memory_pages;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'contributions') then
    alter publication supabase_realtime add table public.contributions;
  end if;
end $$;
