-- Paid access gate: financial data remains isolated by RLS and is available only
-- after backend-confirmed payment approval. Existing financial tables and data are preserved.

CREATE OR REPLACE FUNCTION public.has_active_paid_access()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions s
    WHERE s.user_id = auth.uid()
      AND s.plan = 'pro'
      AND s.status = 'active'
      AND (s.current_period_end_at IS NULL OR s.current_period_end_at > now())
  );
$$;

REVOKE ALL ON FUNCTION public.has_active_paid_access() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_active_paid_access() TO authenticated;

DROP POLICY IF EXISTS accounts_select_own ON public.accounts;
CREATE POLICY accounts_select_own ON public.accounts FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND public.has_active_paid_access());
DROP POLICY IF EXISTS accounts_insert_own ON public.accounts;
CREATE POLICY accounts_insert_own ON public.accounts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.has_active_paid_access());
DROP POLICY IF EXISTS accounts_update_own ON public.accounts;
CREATE POLICY accounts_update_own ON public.accounts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND public.has_active_paid_access())
  WITH CHECK (auth.uid() = user_id AND public.has_active_paid_access());
DROP POLICY IF EXISTS accounts_delete_own ON public.accounts;
CREATE POLICY accounts_delete_own ON public.accounts FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND public.has_active_paid_access());

DROP POLICY IF EXISTS categories_select_own ON public.categories;
CREATE POLICY categories_select_own ON public.categories FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND public.has_active_paid_access());
DROP POLICY IF EXISTS categories_insert_own ON public.categories;
CREATE POLICY categories_insert_own ON public.categories FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.has_active_paid_access());
DROP POLICY IF EXISTS categories_update_own ON public.categories;
CREATE POLICY categories_update_own ON public.categories FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND public.has_active_paid_access())
  WITH CHECK (auth.uid() = user_id AND public.has_active_paid_access());
DROP POLICY IF EXISTS categories_delete_own ON public.categories;
CREATE POLICY categories_delete_own ON public.categories FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND public.has_active_paid_access());

DROP POLICY IF EXISTS credit_cards_select_own ON public.credit_cards;
CREATE POLICY credit_cards_select_own ON public.credit_cards FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND public.has_active_paid_access());
DROP POLICY IF EXISTS credit_cards_insert_own ON public.credit_cards;
CREATE POLICY credit_cards_insert_own ON public.credit_cards FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.has_active_paid_access());
DROP POLICY IF EXISTS credit_cards_update_own ON public.credit_cards;
CREATE POLICY credit_cards_update_own ON public.credit_cards FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND public.has_active_paid_access())
  WITH CHECK (auth.uid() = user_id AND public.has_active_paid_access());
DROP POLICY IF EXISTS credit_cards_delete_own ON public.credit_cards;
CREATE POLICY credit_cards_delete_own ON public.credit_cards FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND public.has_active_paid_access());

DROP POLICY IF EXISTS credit_card_purchases_select_own ON public.credit_card_purchases;
CREATE POLICY credit_card_purchases_select_own ON public.credit_card_purchases FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND public.has_active_paid_access());
DROP POLICY IF EXISTS credit_card_purchases_insert_own ON public.credit_card_purchases;
CREATE POLICY credit_card_purchases_insert_own ON public.credit_card_purchases FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.has_active_paid_access());
DROP POLICY IF EXISTS credit_card_purchases_update_own ON public.credit_card_purchases;
CREATE POLICY credit_card_purchases_update_own ON public.credit_card_purchases FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND public.has_active_paid_access())
  WITH CHECK (auth.uid() = user_id AND public.has_active_paid_access());
DROP POLICY IF EXISTS credit_card_purchases_delete_own ON public.credit_card_purchases;
CREATE POLICY credit_card_purchases_delete_own ON public.credit_card_purchases FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND public.has_active_paid_access());

DROP POLICY IF EXISTS bills_select_own ON public.bills;
CREATE POLICY bills_select_own ON public.bills FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND public.has_active_paid_access());
DROP POLICY IF EXISTS bills_insert_own ON public.bills;
CREATE POLICY bills_insert_own ON public.bills FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.has_active_paid_access());
DROP POLICY IF EXISTS bills_update_own ON public.bills;
CREATE POLICY bills_update_own ON public.bills FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND public.has_active_paid_access())
  WITH CHECK (auth.uid() = user_id AND public.has_active_paid_access());
DROP POLICY IF EXISTS bills_delete_own ON public.bills;
CREATE POLICY bills_delete_own ON public.bills FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND public.has_active_paid_access());

DROP POLICY IF EXISTS transactions_select_own ON public.transactions;
CREATE POLICY transactions_select_own ON public.transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND public.has_active_paid_access());
DROP POLICY IF EXISTS transactions_insert_own ON public.transactions;
CREATE POLICY transactions_insert_own ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.has_active_paid_access());
DROP POLICY IF EXISTS transactions_update_own ON public.transactions;
CREATE POLICY transactions_update_own ON public.transactions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND public.has_active_paid_access())
  WITH CHECK (auth.uid() = user_id AND public.has_active_paid_access());
DROP POLICY IF EXISTS transactions_delete_own ON public.transactions;
CREATE POLICY transactions_delete_own ON public.transactions FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND public.has_active_paid_access());

DROP POLICY IF EXISTS goals_select_own ON public.goals;
CREATE POLICY goals_select_own ON public.goals FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND public.has_active_paid_access());
DROP POLICY IF EXISTS goals_insert_own ON public.goals;
CREATE POLICY goals_insert_own ON public.goals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.has_active_paid_access());
DROP POLICY IF EXISTS goals_update_own ON public.goals;
CREATE POLICY goals_update_own ON public.goals FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND public.has_active_paid_access())
  WITH CHECK (auth.uid() = user_id AND public.has_active_paid_access());
DROP POLICY IF EXISTS goals_delete_own ON public.goals;
CREATE POLICY goals_delete_own ON public.goals FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND public.has_active_paid_access());
