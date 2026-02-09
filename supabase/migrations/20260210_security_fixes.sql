-- Fix Security: Mutable search_path on functions
-- This prevents potential SQL injection attacks via search_path manipulation

-- Fix handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Fix check_and_increment_usage function (from rate_limiting migration)
CREATE OR REPLACE FUNCTION public.check_and_increment_usage(p_user_id uuid)
RETURNS TABLE(allowed boolean, current_count integer, tier_limit integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tier text;
    v_limit integer;
    v_current integer;
BEGIN
    -- Get user's subscription tier
    SELECT subscription_tier INTO v_tier
    FROM public.users
    WHERE user_id = p_user_id;

    -- Set limit based on tier
    v_limit := CASE v_tier
        WHEN 'pro' THEN 100
        WHEN 'enterprise' THEN 1000
        ELSE 10 -- free tier
    END;

    -- Get or create usage record
    INSERT INTO public.user_usage (user_id, usage_count, last_used_at)
    VALUES (p_user_id, 0, now())
    ON CONFLICT (user_id) DO NOTHING;

    -- Get current count
    SELECT usage_count INTO v_current
    FROM public.user_usage
    WHERE user_id = p_user_id;

    -- Check if allowed
    IF v_current < v_limit THEN
        -- Increment usage
        UPDATE public.user_usage
        SET usage_count = usage_count + 1, last_used_at = now()
        WHERE user_id = p_user_id;

        RETURN QUERY SELECT true, v_current + 1, v_limit;
    ELSE
        RETURN QUERY SELECT false, v_current, v_limit;
    END IF;
END;
$$;
