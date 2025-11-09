# Database Schema for Fitness Tracker

This document describes the database schema needed for the Fitness Tracker app.
You'll need to create these tables in your Supabase project.

## Tables

### 1. profiles
Extends the default auth.users table with additional user information.

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );
```

### 2. groups
Stores fitness tracking groups (e.g., Family, Friends).

```sql
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

alter table groups enable row level security;

create policy "Groups are viewable by members."
  on groups for select
  using (
    exists (
      select 1 from group_members
      where group_members.group_id = groups.id
      and group_members.user_id = auth.uid()
    )
  );

create policy "Authenticated users can create groups."
  on groups for insert
  with check ( auth.uid() = created_by );

create policy "Group creators can update their groups."
  on groups for update
  using ( auth.uid() = created_by );
```

### 3. group_members
Tracks which users belong to which groups.

```sql
create table group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references groups on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text default 'member' check (role in ('admin', 'member')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(group_id, user_id)
);

alter table group_members enable row level security;

create policy "Group members are viewable by other members."
  on group_members for select
  using (
    exists (
      select 1 from group_members gm
      where gm.group_id = group_members.group_id
      and gm.user_id = auth.uid()
    )
  );

create policy "Users can join groups."
  on group_members for insert
  with check ( auth.uid() = user_id );

create policy "Admins can manage members."
  on group_members for delete
  using (
    exists (
      select 1 from group_members gm
      where gm.group_id = group_members.group_id
      and gm.user_id = auth.uid()
      and gm.role = 'admin'
    )
  );
```

### 4. activity_logs
Tracks daily activity for each user.

```sql
create table activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  group_id uuid references groups on delete cascade not null,
  activity_date date not null,
  is_active boolean default true,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, group_id, activity_date)
);

alter table activity_logs enable row level security;

create policy "Users can view activity logs in their groups."
  on activity_logs for select
  using (
    exists (
      select 1 from group_members
      where group_members.group_id = activity_logs.group_id
      and group_members.user_id = auth.uid()
    )
  );

create policy "Users can insert their own activity."
  on activity_logs for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own activity."
  on activity_logs for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own activity."
  on activity_logs for delete
  using ( auth.uid() = user_id );
```

### 5. streaks
Tracks current and longest streaks for users in each group.

```sql
create table streaks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  group_id uuid references groups on delete cascade not null,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_activity_date date,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, group_id)
);

alter table streaks enable row level security;

create policy "Users can view streaks in their groups."
  on streaks for select
  using (
    exists (
      select 1 from group_members
      where group_members.group_id = streaks.group_id
      and group_members.user_id = auth.uid()
    )
  );

create policy "Users can manage their own streaks."
  on streaks for all
  using ( auth.uid() = user_id );
```

### 6. monthly_winners
Tracks the winner for each group each month.

```sql
create table monthly_winners (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references groups on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  month integer not null check (month >= 1 and month <= 12),
  year integer not null,
  active_days integer not null,
  prize_amount numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(group_id, month, year)
);

alter table monthly_winners enable row level security;

create policy "Winners are viewable by group members."
  on monthly_winners for select
  using (
    exists (
      select 1 from group_members
      where group_members.group_id = monthly_winners.group_id
      and group_members.user_id = auth.uid()
    )
  );
```

## Functions

### Update streak function
This function should be called whenever an activity is logged.

```sql
create or replace function update_user_streak(
  p_user_id uuid,
  p_group_id uuid,
  p_activity_date date
)
returns void
language plpgsql
security definer
as $$
declare
  v_last_date date;
  v_current_streak integer;
  v_longest_streak integer;
begin
  -- Get current streak data
  select last_activity_date, current_streak, longest_streak
  into v_last_date, v_current_streak, v_longest_streak
  from streaks
  where user_id = p_user_id and group_id = p_group_id;

  -- If no streak record exists, create one
  if not found then
    insert into streaks (user_id, group_id, current_streak, longest_streak, last_activity_date)
    values (p_user_id, p_group_id, 1, 1, p_activity_date);
    return;
  end if;

  -- Check if activity is consecutive
  if v_last_date is null or p_activity_date = v_last_date + interval '1 day' then
    v_current_streak := v_current_streak + 1;
  elsif p_activity_date > v_last_date + interval '1 day' then
    v_current_streak := 1;
  end if;

  -- Update longest streak if needed
  if v_current_streak > v_longest_streak then
    v_longest_streak := v_current_streak;
  end if;

  -- Update streak record
  update streaks
  set current_streak = v_current_streak,
      longest_streak = v_longest_streak,
      last_activity_date = p_activity_date,
      updated_at = now()
  where user_id = p_user_id and group_id = p_group_id;
end;
$$;
```

## Setup Instructions

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste each table creation script above
4. Run them in order
5. Create the update_user_streak function
6. Your database is ready!

