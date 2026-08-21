-- Internal test access is an explicit server-owned provider state.
-- This does not change RLS or any financial table policy.
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_provider_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_provider_check
  CHECK (provider IS NULL OR provider IN ('hubla', 'stripe', 'mercadopago', 'manual', 'internal_test'));
