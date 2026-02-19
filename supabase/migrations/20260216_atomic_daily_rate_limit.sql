-- Atomic daily usage check+increment to prevent concurrent limit bypasses.
-- Uses public.user_usages (date-partitioned per user).

CREATE OR REPLACE FUNCTION public.check_and_increment_daily_usage(
  p_user_id uuid,
  p_daily_limit integer
)
RETURNS TABLE(
  allowed boolean,
  current_count integer,
  remaining integer,
  reset_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date := (timezone('utc', now()))::date;
  v_count integer;
  v_reset timestamp with time zone := date_trunc('day', timezone('utc', now()) + interval '1 day');
BEGIN
  -- Ensure a row exists and reset count when day rolls over.
  INSERT INTO public.user_usages (user_id, date, generation_count, last_updated)
  VALUES (p_user_id, v_today, 0, now())
  ON CONFLICT (user_id) DO UPDATE
  SET
    date = CASE
      WHEN public.user_usages.date < v_today THEN v_today
      ELSE public.user_usages.date
    END,
    generation_count = CASE
      WHEN public.user_usages.date < v_today THEN 0
      ELSE public.user_usages.generation_count
    END,
    last_updated = now();

  -- Increment only if still below limit.
  UPDATE public.user_usages
  SET generation_count = generation_count + 1,
      last_updated = now()
  WHERE user_id = p_user_id
    AND date = v_today
    AND generation_count < p_daily_limit
  RETURNING generation_count INTO v_count;

  IF v_count IS NOT NULL THEN
    RETURN QUERY SELECT true, v_count, GREATEST(p_daily_limit - v_count, 0), v_reset;
    RETURN;
  END IF;

  -- Already at/above limit.
  SELECT generation_count
  INTO v_count
  FROM public.user_usages
  WHERE user_id = p_user_id
    AND date = v_today;

  RETURN QUERY SELECT false, COALESCE(v_count, p_daily_limit), 0, v_reset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_and_increment_daily_usage(uuid, integer)
TO authenticated, service_role;
