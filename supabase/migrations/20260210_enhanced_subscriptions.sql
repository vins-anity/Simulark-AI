-- Migration: Enhanced subscription tracking for tier-based features
-- Created: 2026-02-10

-- 1. Create subscription status enum
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'trialing', 'expired');

-- 2. Add new columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subscription_status subscription_status DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS tier_started_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS manual_override boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 3. Create index for subscription expiry checks
CREATE INDEX IF NOT EXISTS idx_users_subscription_expires 
ON public.users(subscription_expires_at) 
WHERE subscription_status = 'active';

-- 4. Create index for admin lookups
CREATE INDEX IF NOT EXISTS idx_users_admin 
ON public.users(is_admin) 
WHERE is_admin = true;

-- 5. Function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_status subscription_status;
  v_expires_at timestamp with time zone;
BEGIN
  SELECT subscription_status, subscription_expires_at 
  INTO v_status, v_expires_at
  FROM public.users 
  WHERE user_id = p_user_id;
  
  -- If no expiry date or manual override, check status only
  IF v_expires_at IS NULL OR (SELECT manual_override FROM public.users WHERE user_id = p_user_id) THEN
    RETURN v_status IN ('active', 'trialing');
  END IF;
  
  -- Check if expired
  RETURN v_status IN ('active', 'trialing') AND v_expires_at > now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to auto-downgrade expired subscriptions
CREATE OR REPLACE FUNCTION public.downgrade_expired_subscriptions()
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET 
    subscription_tier = 'free',
    subscription_status = 'expired',
    updated_at = now()
  WHERE 
    subscription_status = 'active'
    AND subscription_expires_at IS NOT NULL
    AND subscription_expires_at < now()
    AND manual_override = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Function to get user tier with validity check
CREATE OR REPLACE FUNCTION public.get_effective_tier(p_user_id uuid)
RETURNS text AS $$
DECLARE
  v_tier text;
  v_has_active boolean;
BEGIN
  -- Check if subscription is still active
  v_has_active := public.has_active_subscription(p_user_id);
  
  SELECT subscription_tier INTO v_tier
  FROM public.users 
  WHERE user_id = p_user_id;
  
  -- Return free tier if subscription expired
  IF NOT v_has_active AND v_tier != 'free' THEN
    RETURN 'free';
  END IF;
  
  RETURN COALESCE(v_tier, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Security definer function to check admin status (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin_user(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE user_id = p_user_id AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Admin policies for subscription management using the security definer function
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    public.is_admin_user(auth.uid())
  );

CREATE POLICY "Admins can update any user subscription" ON public.users
  FOR UPDATE USING (
    public.is_admin_user(auth.uid())
  );

-- 10. Update existing users to have proper defaults
UPDATE public.users 
SET subscription_status = 'active'
WHERE subscription_status IS NULL;

-- 11. Create subscription history table for audit trail
CREATE TABLE IF NOT EXISTS public.subscription_history (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(user_id) NOT NULL,
  old_tier text,
  new_tier text,
  old_status subscription_status,
  new_status subscription_status,
  changed_by uuid REFERENCES public.users(user_id), -- admin who made the change
  change_reason text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for subscription history
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription history" ON public.subscription_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscription history" ON public.subscription_history
  FOR SELECT USING (
    public.is_admin_user(auth.uid())
  );

CREATE POLICY "Admins can insert subscription history" ON public.subscription_history
  FOR INSERT WITH CHECK (
    public.is_admin_user(auth.uid())
  );
