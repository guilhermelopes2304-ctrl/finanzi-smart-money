-- FINANZZI billing foundation.
-- Additive only: does not alter existing financial tables or their RLS policies.
-- Provider integration is intentionally absent; only backend-owned state is prepared.

CREATE TABLE IF NOT EXISTS public.subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'trialing', 'active', 'past_due', 'canceled', 'expired', 'checkout_pending')),
  billing_interval TEXT CHECK (billing_interval IS NULL OR billing_interval IN ('monthly', 'annual')),
  started_at TIMESTAMPTZ,
  trial_start_at TIMESTAMPTZ,
  trial_end_at TIMESTAMPTZ,
  current_period_start_at TIMESTAMPTZ,
  current_period_end_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  external_customer_id TEXT UNIQUE,
  external_subscription_id TEXT UNIQUE,
  last_webhook_id TEXT,
  last_webhook_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.billing_checkout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('pro_monthly', 'pro_annual')),
  status TEXT NOT NULL DEFAULT 'prepared' CHECK (status IN ('prepared', 'redirect_pending', 'completed', 'failed', 'canceled')),
  provider TEXT,
  external_checkout_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS billing_checkout_requests_user_created_idx
  ON public.billing_checkout_requests (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.billing_webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'ignored', 'failed')),
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS billing_webhook_events_user_received_idx
  ON public.billing_webhook_events (user_id, received_at DESC);

DROP TRIGGER IF EXISTS subscriptions_updated ON public.subscriptions;
CREATE TRIGGER subscriptions_updated
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS billing_checkout_requests_updated ON public.billing_checkout_requests;
CREATE TRIGGER billing_checkout_requests_updated
BEFORE UPDATE ON public.billing_checkout_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_checkout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_webhook_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.subscriptions FROM authenticated;
GRANT SELECT ON TABLE public.subscriptions TO authenticated;
GRANT ALL ON TABLE public.subscriptions TO service_role;

REVOKE ALL ON TABLE public.billing_checkout_requests FROM authenticated;
GRANT SELECT ON TABLE public.billing_checkout_requests TO authenticated;
GRANT ALL ON TABLE public.billing_checkout_requests TO service_role;

REVOKE ALL ON TABLE public.billing_webhook_events FROM authenticated;
GRANT ALL ON TABLE public.billing_webhook_events TO service_role;

DROP POLICY IF EXISTS subscriptions_select_own ON public.subscriptions;
CREATE POLICY subscriptions_select_own ON public.subscriptions
FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS billing_checkout_requests_select_own ON public.billing_checkout_requests;
CREATE POLICY billing_checkout_requests_select_own ON public.billing_checkout_requests
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.ensure_free_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_create_subscription ON public.profiles;
CREATE TRIGGER profiles_create_subscription
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.ensure_free_subscription();

INSERT INTO public.subscriptions (user_id)
SELECT p.id FROM public.profiles p
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.sync_profile_plan_from_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET plan = CASE
    WHEN NEW.plan = 'pro' AND NEW.status IN ('trialing', 'active')
      AND (NEW.current_period_end_at IS NULL OR NEW.current_period_end_at > now())
      THEN 'pro'
    ELSE 'free'
  END
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS subscriptions_sync_profile_plan ON public.subscriptions;
CREATE TRIGGER subscriptions_sync_profile_plan
AFTER INSERT OR UPDATE OF plan, status, current_period_end_at ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_plan_from_subscription();

CREATE OR REPLACE FUNCTION public.get_current_entitlements()
RETURNS TABLE (
  plan TEXT,
  status TEXT,
  billing_interval TEXT,
  trial_ends_at TIMESTAMPTZ,
  current_period_ends_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN,
  is_pro BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    COALESCE(s.plan, 'free') AS plan,
    COALESCE(s.status, 'free') AS status,
    s.billing_interval,
    s.trial_end_at,
    s.current_period_end_at,
    COALESCE(s.cancel_at_period_end, FALSE),
    (
      COALESCE(s.plan, 'free') = 'pro'
      AND COALESCE(s.status, 'free') IN ('trialing', 'active')
      AND (s.current_period_end_at IS NULL OR s.current_period_end_at > now())
    ) AS is_pro
  FROM (SELECT auth.uid() AS user_id) actor
  LEFT JOIN public.subscriptions s ON s.user_id = actor.user_id;
$$;

REVOKE ALL ON FUNCTION public.get_current_entitlements() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_current_entitlements() TO authenticated;

CREATE OR REPLACE FUNCTION public.billing_is_pro(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = p_user_id
      AND s.plan = 'pro'
      AND s.status IN ('trialing', 'active')
      AND (s.current_period_end_at IS NULL OR s.current_period_end_at > now())
  );
$$;

REVOKE ALL ON FUNCTION public.billing_is_pro(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.billing_is_pro(UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.prepare_billing_checkout(p_plan_id TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_checkout_id UUID;
  v_interval TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required' USING ERRCODE = '42501';
  END IF;
  IF p_plan_id NOT IN ('pro_monthly', 'pro_annual') THEN
    RAISE EXCEPTION 'Unsupported billing plan' USING ERRCODE = '22023';
  END IF;

  v_interval := CASE WHEN p_plan_id = 'pro_annual' THEN 'annual' ELSE 'monthly' END;

  INSERT INTO public.billing_checkout_requests (user_id, plan_id, status, provider)
  VALUES (v_user_id, p_plan_id, 'prepared', NULL)
  RETURNING id INTO v_checkout_id;

  INSERT INTO public.subscriptions (user_id, plan, status, billing_interval)
  VALUES (v_user_id, 'pro', 'checkout_pending', v_interval)
  ON CONFLICT (user_id) DO UPDATE
    SET plan = 'pro', status = 'checkout_pending', billing_interval = EXCLUDED.billing_interval,
        current_period_start_at = NULL, current_period_end_at = NULL,
        trial_start_at = NULL, trial_end_at = NULL,
        cancel_at_period_end = FALSE, canceled_at = NULL,
        updated_at = now();

  RETURN v_checkout_id;
END;
$$;

REVOKE ALL ON FUNCTION public.prepare_billing_checkout(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prepare_billing_checkout(TEXT) TO authenticated;
