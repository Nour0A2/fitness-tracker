-- ============================================
-- COMPLETE SUPABASE SETUP - RUN THIS ONCE
-- ============================================
-- Copy and paste this entire file into Supabase SQL Editor
-- Then click "RUN" to create all tables at once!

-- STEP 1: CREATE ALL TABLES FIRST (without policies)
-- ====================================================

-- 1. PROFILES TABLE
-- Stores user information (name, email, etc.)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. GROUPS TABLE
-- Stores fitness groups (Family, Friends, etc.)
create table groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  prize_amount numeric default 5.00,
  currency text default 'DT',
  created_by uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. GROUP MEMBERS TABLE
-- Tracks who is in which group
create table group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references groups on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(group_id, user_id)
);

-- 4. ACTIVITY LOGS TABLE
-- Tracks daily active/inactive status
create table activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  group_id uuid references groups on delete cascade not null,
  date date not null,
  is_active boolean default true,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, group_id, date)
);

-- 5. STREAKS TABLE
-- Tracks current and longest streaks
create table streaks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  group_id uuid references groups on delete cascade not null,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_active_date date,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, group_id)
);

-- 6. MONTHLY WINNERS TABLE
-- Tracks who won each month in each group
create table monthly_winners (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references groups on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  month date not null,
  active_days_count integer not null,
  prize_amount numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(group_id, month)
);

-- STEP 2: ENABLE ROW LEVEL SECURITY
-- ====================================================

alter table profiles enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table activity_logs enable row level security;
alter table streaks enable row level security;
alter table monthly_winners enable row level security;

-- STEP 3: CREATE POLICIES (after all tables exist)
-- ====================================================

-- Profiles policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Groups policies
create policy "Groups are viewable by members."
  on groups for select
  using (
    auth.uid() in (
      select user_id from group_members where group_id = groups.id
    )
  );

create policy "Users can create groups."
  on groups for insert
  with check ( auth.uid() = created_by );

create policy "Group creators can update their groups."
  on groups for update
  using ( auth.uid() = created_by );

-- Group members policies
create policy "Group members are viewable by group members."
  on group_members for select
  using (
    auth.uid() in (
      select user_id from group_members gm where gm.group_id = group_members.group_id
    )
  );

create policy "Users can join groups."
  on group_members for insert
  with check ( auth.uid() = user_id );

create policy "Users can leave groups."
  on group_members for delete
  using ( auth.uid() = user_id );

-- Activity logs policies
create policy "Users can view activity logs in their groups."
  on activity_logs for select
  using (
    auth.uid() in (
      select user_id from group_members where group_id = activity_logs.group_id
    )
  );

create policy "Users can insert their own activity logs."
  on activity_logs for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own activity logs."
  on activity_logs for update
  using ( auth.uid() = user_id );

-- Streaks policies
create policy "Users can view streaks in their groups."
  on streaks for select
  using (
    auth.uid() in (
      select user_id from group_members where group_id = streaks.group_id
    )
  );

create policy "Users can insert their own streaks."
  on streaks for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own streaks."
  on streaks for update
  using ( auth.uid() = user_id );

-- Monthly winners policies
create policy "Monthly winners are viewable by group members."
  on monthly_winners for select
  using (
    auth.uid() in (
      select user_id from group_members where group_id = monthly_winners.group_id
    )
  );

-- STEP 4: CREATE HELPER FUNCTION
-- ====================================================

-- Function to update streaks automatically
create or replace function update_user_streak(
  p_user_id uuid,
  p_group_id uuid,
  p_date date
)
returns void as $$
declare
  v_current_streak integer := 0;
  v_longest_streak integer := 0;
  v_last_date date;
begin
  -- Get the last active date
  select last_active_date into v_last_date
  from streaks
  where user_id = p_user_id and group_id = p_group_id;

  -- Calculate current streak
  if v_last_date is null then
    v_current_streak := 1;
  elsif p_date = v_last_date + interval '1 day' then
    select current_streak + 1 into v_current_streak
    from streaks
    where user_id = p_user_id and group_id = p_group_id;
  elsif p_date = v_last_date then
    -- Same day, don't change streak
    select current_streak into v_current_streak
    from streaks
    where user_id = p_user_id and group_id = p_group_id;
  else
    -- Streak broken
    v_current_streak := 1;
  end if;

  -- Get longest streak
  select longest_streak into v_longest_streak
  from streaks
  where user_id = p_user_id and group_id = p_group_id;

  if v_longest_streak is null or v_current_streak > v_longest_streak then
    v_longest_streak := v_current_streak;
  end if;

  -- Insert or update streak
  insert into streaks (user_id, group_id, current_streak, longest_streak, last_active_date)
  values (p_user_id, p_group_id, v_current_streak, v_longest_streak, p_date)
  on conflict (user_id, group_id)
  do update set
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_active_date = p_date,
    updated_at = now();
end;
$$ language plpgsql security definer;

-- ============================================
-- SETUP COMPLETE! 🎉
-- ============================================
-- Your database is ready to use!
-- All tables created with Row Level Security enabled!
-- Go back to your app and try signing up!

