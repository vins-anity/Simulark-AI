-- Migration Fix: Resolve RLS infinite recursion in admin policies
-- Created: 2026-02-10
-- Issue: Admin policies were causing infinite recursion by querying users table within RLS

-- 1. First, drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update any user subscription" ON public.users;
DROP POLICY IF EXISTS "Admins can view all subscription history" ON public.subscription_history;
DROP POLICY IF EXISTS "Admins can insert subscription history" ON public.subscription_history;

-- 2. Create security definer function to check admin status (bypasses RLS)
-- This function runs with the privileges of the function creator, not the caller
CREATE OR REPLACE FUNCTION public.is_admin_user(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE user_id = p_user_id AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate admin policies using the security definer function
-- This avoids infinite recursion because the function bypasses RLS

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    public.is_admin_user(auth.uid())
  );

CREATE POLICY "Admins can update any user subscription" ON public.users
  FOR UPDATE USING (
    public.is_admin_user(auth.uid())
  );

CREATE POLICY "Admins can view all subscription history" ON public.subscription_history
  FOR SELECT USING (
    public.is_admin_user(auth.uid())
  );

CREATE POLICY "Admins can insert subscription history" ON public.subscription_history
  FOR INSERT WITH CHECK (
    public.is_admin_user(auth.uid())
  );

-- 4. Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO authenticated;
