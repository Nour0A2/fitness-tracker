-- ============================================
-- FIX PROFILES TABLE RLS POLICIES
-- ============================================

-- Enable RLS on profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "profiles_all" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- Create simple, permissive policies for profiles
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_insert_all" ON profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "profiles_update_all" ON profiles
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- DONE! 🎉
-- ============================================
-- Now profiles table should be accessible for group member queries
