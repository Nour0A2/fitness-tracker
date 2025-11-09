-- ============================================
-- ADD INVITATIONS FEATURE
-- ============================================
-- Run this to enable email invitations!

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references groups on delete cascade not null,
  email text not null,
  invited_by uuid references auth.users on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(group_id, email)
);

-- Enable RLS
alter table invitations enable row level security;

-- Policies
create policy "Anyone can view invitations"
  on invitations for select
  using ( true );

create policy "Users can invite to their groups"
  on invitations for insert
  with check ( 
    auth.uid() = invited_by
  );

create policy "Users can update invitations they sent"
  on invitations for update
  using ( auth.uid() = invited_by );

-- ============================================
-- DONE! 🎉
-- ============================================

