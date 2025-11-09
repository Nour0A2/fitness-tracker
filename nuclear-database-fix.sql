-- ============================================
-- NUCLEAR DATABASE FIX - Drops EVERYTHING and rebuilds
-- ============================================

-- 1. CREATE MISSING INVITATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS invitations (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  email text not null,
  invited_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  used_at timestamp with time zone,
  
  -- Ensure unique invitation per email per group
  unique(group_id, email)
);

-- Enable RLS on invitations table
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- 2. NUCLEAR OPTION - DROP ALL POLICIES ON ALL TABLES
-- ============================================

-- Get all policy names and drop them
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on group_members
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'group_members' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON group_members';
    END LOOP;
    
    -- Drop all policies on groups
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'groups' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON groups';
    END LOOP;
    
    -- Drop all policies on activity_logs
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'activity_logs' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON activity_logs';
    END LOOP;
    
    -- Drop all policies on streaks
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'streaks' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON streaks';
    END LOOP;
    
    -- Drop all policies on monthly_winners
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'monthly_winners' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON monthly_winners';
    END LOOP;
    
    -- Drop all policies on invitations
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'invitations' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON invitations';
    END LOOP;
END
$$;

-- 3. CREATE BRAND NEW POLICIES WITH UNIQUE NAMES
-- ============================================

-- GROUP_MEMBERS policies
CREATE POLICY "gm_select_2024"
  ON group_members FOR SELECT
  USING ( true );

CREATE POLICY "gm_insert_2024"
  ON group_members FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "gm_delete_2024"
  ON group_members FOR DELETE
  USING ( auth.uid() = user_id );

-- GROUPS policies
CREATE POLICY "g_select_2024"
  ON groups FOR SELECT
  USING ( true );

CREATE POLICY "g_insert_2024"
  ON groups FOR INSERT
  WITH CHECK ( auth.uid() = created_by );

CREATE POLICY "g_update_2024"
  ON groups FOR UPDATE
  USING ( auth.uid() = created_by );

-- INVITATIONS policies
CREATE POLICY "inv_select_2024"
  ON invitations FOR SELECT
  USING ( true );

CREATE POLICY "inv_insert_2024"
  ON invitations FOR INSERT
  WITH CHECK ( auth.uid() = invited_by );

CREATE POLICY "inv_update_2024"
  ON invitations FOR UPDATE
  USING ( auth.uid() = invited_by );

-- ACTIVITY_LOGS policies
CREATE POLICY "al_select_2024"
  ON activity_logs FOR SELECT
  USING ( true );

CREATE POLICY "al_insert_2024"
  ON activity_logs FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "al_update_2024"
  ON activity_logs FOR UPDATE
  USING ( auth.uid() = user_id );

-- STREAKS policies
CREATE POLICY "s_select_2024"
  ON streaks FOR SELECT
  USING ( true );

CREATE POLICY "s_insert_2024"
  ON streaks FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "s_update_2024"
  ON streaks FOR UPDATE
  USING ( auth.uid() = user_id );

-- MONTHLY_WINNERS policies
CREATE POLICY "mw_select_2024"
  ON monthly_winners FOR SELECT
  USING ( true );

-- ============================================
-- DONE! 🎉
-- ============================================
-- All old policies nuked and new ones created with unique names!
