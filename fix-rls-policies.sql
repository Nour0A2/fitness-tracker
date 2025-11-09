-- ============================================
-- FIX RLS POLICIES - Run this to fix infinite recursion
-- ============================================

-- 1. DROP ALL EXISTING POLICIES
-- ============================================

-- Drop group_members policies
DROP POLICY IF EXISTS "Group members are viewable by group members." ON group_members;
DROP POLICY IF EXISTS "Users can join groups." ON group_members;
DROP POLICY IF EXISTS "Users can leave groups." ON group_members;

-- Drop groups policies
DROP POLICY IF EXISTS "Groups are viewable by members." ON groups;
DROP POLICY IF EXISTS "Users can create groups." ON groups;
DROP POLICY IF EXISTS "Group creators can update their groups." ON groups;

-- Drop other policies that might reference group_members
DROP POLICY IF EXISTS "Users can view activity logs in their groups." ON activity_logs;
DROP POLICY IF EXISTS "Users can view streaks in their groups." ON streaks;
DROP POLICY IF EXISTS "Monthly winners are viewable by group members." ON monthly_winners;

-- 2. CREATE NEW SIMPLIFIED POLICIES
-- ============================================

-- GROUP_MEMBERS policies (no self-reference)
CREATE POLICY "Anyone can view group members"
  ON group_members FOR SELECT
  USING ( true );

CREATE POLICY "Users can join groups"
  ON group_members FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can leave groups"
  ON group_members FOR DELETE
  USING ( auth.uid() = user_id );

-- GROUPS policies (simple, no recursion)
CREATE POLICY "Anyone can view groups"
  ON groups FOR SELECT
  USING ( true );

CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  WITH CHECK ( auth.uid() = created_by );

CREATE POLICY "Group creators can update their groups"
  ON groups FOR UPDATE
  USING ( auth.uid() = created_by );

-- ACTIVITY_LOGS policies (simple)
CREATE POLICY "Users can view all activity logs"
  ON activity_logs FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own activity logs"
  ON activity_logs FOR UPDATE
  USING ( auth.uid() = user_id );

-- STREAKS policies (simple)
CREATE POLICY "Users can view all streaks"
  ON streaks FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own streaks"
  ON streaks FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own streaks"
  ON streaks FOR UPDATE
  USING ( auth.uid() = user_id );

-- MONTHLY_WINNERS policies (simple)
CREATE POLICY "Anyone can view monthly winners"
  ON monthly_winners FOR SELECT
  USING ( true );

-- ============================================
-- DONE! 🎉
-- ============================================
-- All policies are now simplified and won't cause recursion
-- Try creating a group again!

