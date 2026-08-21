-- Hubla billing metadata. Additive only: no financial data or existing RLS is removed.
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS provider_product_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_offer_id TEXT;

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_provider_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_provider_check
  CHECK (provider IS NULL OR provider IN ('hubla', 'stripe', 'mercadopago', 'manual'));

CREATE INDEX IF NOT EXISTS subscriptions_provider_subscription_idx
  ON public.subscriptions (provider, external_subscription_id);

COMMENT ON COLUMN public.subscriptions.provider IS
  'Payment provider that owns the external subscription lifecycle.';
COMMENT ON COLUMN public.subscriptions.provider_product_id IS
  'Product identifier at the payment provider.';
COMMENT ON COLUMN public.subscriptions.provider_offer_id IS
  'Offer/price identifier at the payment provider.';
