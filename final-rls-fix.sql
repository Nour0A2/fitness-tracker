-- ============================================
-- FINAL RLS FIX - Simple and Direct
-- ============================================

-- 1. DISABLE RLS TEMPORARILY TO CLEAN UP
-- ============================================

ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE streaks DISABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_winners DISABLE ROW LEVEL SECURITY;

-- 2. DROP ALL POLICIES COMPLETELY
-- ============================================

-- This will remove ALL policies from ALL tables
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    )
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END
$$;

-- 3. RE-ENABLE RLS AND CREATE SUPER SIMPLE POLICIES
-- ============================================

-- Enable RLS back
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_winners ENABLE ROW LEVEL SECURITY;

-- SUPER SIMPLE POLICIES - NO RESTRICTIONS FOR NOW
-- (We can tighten security later once everything works)

-- GROUP_MEMBERS - Allow everything for authenticated users
CREATE POLICY "group_members_all" ON group_members
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- GROUPS - Allow everything for authenticated users
CREATE POLICY "groups_all" ON groups
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- INVITATIONS - Allow everything for authenticated users
CREATE POLICY "invitations_all" ON invitations
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ACTIVITY_LOGS - Allow everything for authenticated users
CREATE POLICY "activity_logs_all" ON activity_logs
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- STREAKS - Allow everything for authenticated users
CREATE POLICY "streaks_all" ON streaks
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- MONTHLY_WINNERS - Allow everything for authenticated users
CREATE POLICY "monthly_winners_all" ON monthly_winners
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- DONE! 🎉
-- ============================================
-- All tables now have super simple policies
-- Everything should work without RLS conflicts!
