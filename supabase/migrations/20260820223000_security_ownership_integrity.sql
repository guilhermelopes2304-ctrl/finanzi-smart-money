-- FINANZZI FASE 0 + FASE 1
-- Security and integrity hardening without automatic data cleanup.
-- Existing rows are intentionally not rewritten.
-- Ownership foreign keys and domain checks are added NOT VALID first; run the
-- read-only audit in supabase/audits before validating them.

-- -----------------------------------------------------------------------------
-- 1. Composite parent keys. Primary keys already guarantee uniqueness of id;
--    these constraints make (id, user_id) available to ownership FKs.
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.accounts'::regclass AND conname = 'accounts_id_user_id_key'
  ) THEN
    ALTER TABLE public.accounts ADD CONSTRAINT accounts_id_user_id_key UNIQUE (id, user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.categories'::regclass AND conname = 'categories_id_user_id_key'
  ) THEN
    ALTER TABLE public.categories ADD CONSTRAINT categories_id_user_id_key UNIQUE (id, user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.credit_cards'::regclass AND conname = 'credit_cards_id_user_id_key'
  ) THEN
    ALTER TABLE public.credit_cards ADD CONSTRAINT credit_cards_id_user_id_key UNIQUE (id, user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.credit_card_purchases'::regclass AND conname = 'credit_card_purchases_id_user_id_key'
  ) THEN
    ALTER TABLE public.credit_card_purchases ADD CONSTRAINT credit_card_purchases_id_user_id_key UNIQUE (id, user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.credit_card_purchases'::regclass AND conname = 'credit_card_purchases_id_card_user_key'
  ) THEN
    ALTER TABLE public.credit_card_purchases ADD CONSTRAINT credit_card_purchases_id_card_user_key UNIQUE (id, credit_card_id, user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.bills'::regclass AND conname = 'bills_id_user_id_key'
  ) THEN
    ALTER TABLE public.bills ADD CONSTRAINT bills_id_user_id_key UNIQUE (id, user_id);
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2. Derive ownership from auth.uid() for authenticated INSERT/UPDATE calls.
--    Service-role/background operations with no auth.uid() keep their explicit
--    owner so existing trusted server workflows are not broken.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.force_authenticated_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  actor_id UUID := auth.uid();
BEGIN
  IF actor_id IS NULL OR auth.role() <> 'authenticated' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.user_id := actor_id;
    RETURN NEW;
  END IF;

  IF OLD.user_id IS DISTINCT FROM actor_id THEN
    RAISE EXCEPTION 'The authenticated user cannot update another user''s row'
      USING ERRCODE = '42501';
  END IF;

  NEW.user_id := OLD.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS accounts_force_owner ON public.accounts;
CREATE TRIGGER accounts_force_owner
BEFORE INSERT OR UPDATE ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.force_authenticated_owner();

DROP TRIGGER IF EXISTS categories_force_owner ON public.categories;
CREATE TRIGGER categories_force_owner
BEFORE INSERT OR UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.force_authenticated_owner();

DROP TRIGGER IF EXISTS credit_cards_force_owner ON public.credit_cards;
CREATE TRIGGER credit_cards_force_owner
BEFORE INSERT OR UPDATE ON public.credit_cards
FOR EACH ROW EXECUTE FUNCTION public.force_authenticated_owner();

DROP TRIGGER IF EXISTS credit_card_purchases_force_owner ON public.credit_card_purchases;
CREATE TRIGGER credit_card_purchases_force_owner
BEFORE INSERT OR UPDATE ON public.credit_card_purchases
FOR EACH ROW EXECUTE FUNCTION public.force_authenticated_owner();

DROP TRIGGER IF EXISTS bills_force_owner ON public.bills;
CREATE TRIGGER bills_force_owner
BEFORE INSERT OR UPDATE ON public.bills
FOR EACH ROW EXECUTE FUNCTION public.force_authenticated_owner();

DROP TRIGGER IF EXISTS transactions_force_owner ON public.transactions;
CREATE TRIGGER transactions_force_owner
BEFORE INSERT OR UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.force_authenticated_owner();

DROP TRIGGER IF EXISTS goals_force_owner ON public.goals;
CREATE TRIGGER goals_force_owner
BEFORE INSERT OR UPDATE ON public.goals
FOR EACH ROW EXECUTE FUNCTION public.force_authenticated_owner();

-- -----------------------------------------------------------------------------
-- 3. Prevent a legitimate delete by user B from mutating data of user A when
--    old invalid cross-user references exist. Same-owner SET NULL behaviour is
--    preserved for accounts/categories/bills; card/purchase cascades remain only
--    for same-owner rows after the composite FK is installed.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_account_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.bills WHERE account_id = OLD.id AND user_id IS DISTINCT FROM OLD.user_id)
     OR EXISTS (SELECT 1 FROM public.transactions WHERE account_id = OLD.id AND user_id IS DISTINCT FROM OLD.user_id) THEN
    RAISE EXCEPTION 'Cannot delete an account with cross-user references'
      USING ERRCODE = '23503';
  END IF;

  UPDATE public.bills SET account_id = NULL
  WHERE account_id = OLD.id AND user_id = OLD.user_id;
  UPDATE public.transactions SET account_id = NULL
  WHERE account_id = OLD.id AND user_id = OLD.user_id;
  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION public.guard_category_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.credit_card_purchases WHERE category_id = OLD.id AND user_id IS DISTINCT FROM OLD.user_id)
     OR EXISTS (SELECT 1 FROM public.bills WHERE category_id = OLD.id AND user_id IS DISTINCT FROM OLD.user_id)
     OR EXISTS (SELECT 1 FROM public.transactions WHERE category_id = OLD.id AND user_id IS DISTINCT FROM OLD.user_id) THEN
    RAISE EXCEPTION 'Cannot delete a category with cross-user references'
      USING ERRCODE = '23503';
  END IF;

  UPDATE public.credit_card_purchases SET category_id = NULL
  WHERE category_id = OLD.id AND user_id = OLD.user_id;
  UPDATE public.bills SET category_id = NULL
  WHERE category_id = OLD.id AND user_id = OLD.user_id;
  UPDATE public.transactions SET category_id = NULL
  WHERE category_id = OLD.id AND user_id = OLD.user_id;
  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION public.guard_card_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.credit_card_purchases WHERE credit_card_id = OLD.id AND user_id IS DISTINCT FROM OLD.user_id)
     OR EXISTS (SELECT 1 FROM public.transactions WHERE credit_card_id = OLD.id AND user_id IS DISTINCT FROM OLD.user_id) THEN
    RAISE EXCEPTION 'Cannot delete a card with cross-user references'
      USING ERRCODE = '23503';
  END IF;
  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION public.guard_purchase_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.transactions WHERE purchase_id = OLD.id AND user_id IS DISTINCT FROM OLD.user_id) THEN
    RAISE EXCEPTION 'Cannot delete a purchase with cross-user references'
      USING ERRCODE = '23503';
  END IF;
  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION public.guard_bill_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.transactions WHERE bill_id = OLD.id AND user_id IS DISTINCT FROM OLD.user_id) THEN
    RAISE EXCEPTION 'Cannot delete a bill with cross-user references'
      USING ERRCODE = '23503';
  END IF;

  UPDATE public.transactions SET bill_id = NULL
  WHERE bill_id = OLD.id AND user_id = OLD.user_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS accounts_delete_guard ON public.accounts;
CREATE TRIGGER accounts_delete_guard
BEFORE DELETE ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.guard_account_delete();

DROP TRIGGER IF EXISTS categories_delete_guard ON public.categories;
CREATE TRIGGER categories_delete_guard
BEFORE DELETE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.guard_category_delete();

DROP TRIGGER IF EXISTS credit_cards_delete_guard ON public.credit_cards;
CREATE TRIGGER credit_cards_delete_guard
BEFORE DELETE ON public.credit_cards
FOR EACH ROW EXECUTE FUNCTION public.guard_card_delete();

DROP TRIGGER IF EXISTS credit_card_purchases_delete_guard ON public.credit_card_purchases;
CREATE TRIGGER credit_card_purchases_delete_guard
BEFORE DELETE ON public.credit_card_purchases
FOR EACH ROW EXECUTE FUNCTION public.guard_purchase_delete();

DROP TRIGGER IF EXISTS bills_delete_guard ON public.bills;
CREATE TRIGGER bills_delete_guard
BEFORE DELETE ON public.bills
FOR EACH ROW EXECUTE FUNCTION public.guard_bill_delete();

-- -----------------------------------------------------------------------------
-- 4. Replace single-column FKs with ownership-aware composite FKs. NOT VALID
--    preserves existing rows and validates all future INSERT/UPDATE operations.
--    The read-only audit must run before VALIDATE CONSTRAINT.
-- -----------------------------------------------------------------------------
ALTER TABLE public.credit_card_purchases
  DROP CONSTRAINT IF EXISTS credit_card_purchases_credit_card_id_fkey,
  DROP CONSTRAINT IF EXISTS credit_card_purchases_category_id_fkey;

ALTER TABLE public.bills
  DROP CONSTRAINT IF EXISTS bills_category_id_fkey,
  DROP CONSTRAINT IF EXISTS bills_account_id_fkey;

ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS transactions_category_id_fkey,
  DROP CONSTRAINT IF EXISTS transactions_account_id_fkey,
  DROP CONSTRAINT IF EXISTS transactions_credit_card_id_fkey,
  DROP CONSTRAINT IF EXISTS transactions_purchase_id_fkey,
  DROP CONSTRAINT IF EXISTS transactions_bill_id_fkey;

ALTER TABLE public.credit_card_purchases
  ADD CONSTRAINT credit_card_purchases_card_owner_fkey
  FOREIGN KEY (credit_card_id, user_id)
  REFERENCES public.credit_cards (id, user_id)
  ON DELETE CASCADE
  NOT VALID,
  ADD CONSTRAINT credit_card_purchases_category_owner_fkey
  FOREIGN KEY (category_id, user_id)
  REFERENCES public.categories (id, user_id)
  ON DELETE SET NULL (category_id)
  NOT VALID;

ALTER TABLE public.bills
  ADD CONSTRAINT bills_category_owner_fkey
  FOREIGN KEY (category_id, user_id)
  REFERENCES public.categories (id, user_id)
  ON DELETE SET NULL (category_id)
  NOT VALID,
  ADD CONSTRAINT bills_account_owner_fkey
  FOREIGN KEY (account_id, user_id)
  REFERENCES public.accounts (id, user_id)
  ON DELETE SET NULL (account_id)
  NOT VALID;

CREATE INDEX IF NOT EXISTS credit_card_purchases_card_user_idx
  ON public.credit_card_purchases (credit_card_id, user_id);
CREATE INDEX IF NOT EXISTS credit_card_purchases_category_user_idx
  ON public.credit_card_purchases (category_id, user_id);
CREATE INDEX IF NOT EXISTS bills_category_user_idx
  ON public.bills (category_id, user_id);
CREATE INDEX IF NOT EXISTS bills_account_user_idx
  ON public.bills (account_id, user_id);
CREATE INDEX IF NOT EXISTS transactions_category_user_idx
  ON public.transactions (category_id, user_id);
CREATE INDEX IF NOT EXISTS transactions_account_user_idx
  ON public.transactions (account_id, user_id);
CREATE INDEX IF NOT EXISTS transactions_card_user_idx
  ON public.transactions (credit_card_id, user_id);
CREATE INDEX IF NOT EXISTS transactions_purchase_user_idx
  ON public.transactions (purchase_id, user_id);
CREATE INDEX IF NOT EXISTS transactions_bill_user_idx
  ON public.transactions (bill_id, user_id);

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_category_owner_fkey
  FOREIGN KEY (category_id, user_id)
  REFERENCES public.categories (id, user_id)
  ON DELETE SET NULL (category_id)
  NOT VALID,
  ADD CONSTRAINT transactions_account_owner_fkey
  FOREIGN KEY (account_id, user_id)
  REFERENCES public.accounts (id, user_id)
  ON DELETE SET NULL (account_id)
  NOT VALID,
  ADD CONSTRAINT transactions_card_owner_fkey
  FOREIGN KEY (credit_card_id, user_id)
  REFERENCES public.credit_cards (id, user_id)
  ON DELETE CASCADE
  NOT VALID,
  ADD CONSTRAINT transactions_purchase_owner_fkey
  FOREIGN KEY (purchase_id, user_id)
  REFERENCES public.credit_card_purchases (id, user_id)
  ON DELETE CASCADE
  NOT VALID,
  ADD CONSTRAINT transactions_purchase_card_owner_fkey
  FOREIGN KEY (purchase_id, credit_card_id, user_id)
  REFERENCES public.credit_card_purchases (id, credit_card_id, user_id)
  ON DELETE CASCADE
  NOT VALID,
  ADD CONSTRAINT transactions_bill_owner_fkey
  FOREIGN KEY (bill_id, user_id)
  REFERENCES public.bills (id, user_id)
  ON DELETE SET NULL (bill_id)
  NOT VALID;

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_purchase_requires_card_check
  CHECK (purchase_id IS NULL OR credit_card_id IS NOT NULL)
  NOT VALID;

-- -----------------------------------------------------------------------------
-- 5. Replace broad FOR ALL policies with explicit operation policies. The
--    authenticated client can only operate on its own rows. The owner triggers
--    also overwrite spoofed user_id values from authenticated requests.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "own accounts" ON public.accounts;
CREATE POLICY accounts_select_own ON public.accounts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY accounts_insert_own ON public.accounts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY accounts_update_own ON public.accounts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY accounts_delete_own ON public.accounts FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own categories" ON public.categories;
CREATE POLICY categories_select_own ON public.categories FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY categories_insert_own ON public.categories FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY categories_update_own ON public.categories FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY categories_delete_own ON public.categories FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own cards" ON public.credit_cards;
CREATE POLICY credit_cards_select_own ON public.credit_cards FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY credit_cards_insert_own ON public.credit_cards FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY credit_cards_update_own ON public.credit_cards FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY credit_cards_delete_own ON public.credit_cards FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own purchases" ON public.credit_card_purchases;
CREATE POLICY credit_card_purchases_select_own ON public.credit_card_purchases FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY credit_card_purchases_insert_own ON public.credit_card_purchases FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY credit_card_purchases_update_own ON public.credit_card_purchases FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY credit_card_purchases_delete_own ON public.credit_card_purchases FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own bills" ON public.bills;
CREATE POLICY bills_select_own ON public.bills FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY bills_insert_own ON public.bills FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY bills_update_own ON public.bills FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY bills_delete_own ON public.bills FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own transactions" ON public.transactions;
CREATE POLICY transactions_select_own ON public.transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY transactions_insert_own ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY transactions_update_own ON public.transactions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY transactions_delete_own ON public.transactions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own goals" ON public.goals;
CREATE POLICY goals_select_own ON public.goals FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY goals_insert_own ON public.goals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY goals_update_own ON public.goals FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY goals_delete_own ON public.goals FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own profile" ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Profile identity, plan and timestamps are system-controlled. The existing
-- onboarding/settings paths only update the five explicitly granted columns.
REVOKE ALL ON TABLE public.profiles FROM authenticated;
GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT UPDATE (name, monthly_income, current_balance, main_goal, onboarded)
  ON TABLE public.profiles TO authenticated;

-- -----------------------------------------------------------------------------
-- 6. Domain constraints are intentionally deferred. The Phase 0 audit contains
--    read-only queries for every candidate domain. Because this environment has
--    no database-admin connection, no unverified CHECK is installed here.
--    After the audit is reviewed, compatible checks can be added separately.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- 7. Atomic purchase + installment creation. The authenticated user is derived
--    from auth.uid(); no user_id parameter is accepted from the frontend.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_card_purchase_with_installments(
  p_credit_card_id UUID,
  p_category_id UUID,
  p_description TEXT,
  p_total_amount NUMERIC,
  p_purchase_date DATE,
  p_installments INTEGER,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_purchase_id UUID;
  v_total_cents BIGINT;
  v_base_cents BIGINT;
  v_remainder BIGINT;
  v_index INTEGER;
  v_month_start DATE;
  v_month_end DATE;
  v_installment_date DATE;
  v_installment_cents BIGINT;
  v_purchase_day INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication is required' USING ERRCODE = '42501';
  END IF;
  IF p_credit_card_id IS NULL THEN
    RAISE EXCEPTION 'A credit card is required' USING ERRCODE = '22023';
  END IF;
  IF p_description IS NULL OR btrim(p_description) = '' THEN
    RAISE EXCEPTION 'A purchase description is required' USING ERRCODE = '22023';
  END IF;
  IF p_total_amount IS NULL OR p_total_amount <= 0 THEN
    RAISE EXCEPTION 'The purchase amount must be greater than zero' USING ERRCODE = '22023';
  END IF;
  IF p_purchase_date IS NULL THEN
    RAISE EXCEPTION 'A purchase date is required' USING ERRCODE = '22023';
  END IF;
  IF p_installments IS NULL OR p_installments < 1 OR p_installments > 72 THEN
    RAISE EXCEPTION 'Installments must be between 1 and 72' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.credit_cards
    WHERE id = p_credit_card_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'The credit card does not belong to the authenticated user'
      USING ERRCODE = '23503';
  END IF;
  IF p_category_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.categories
    WHERE id = p_category_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'The category does not belong to the authenticated user'
      USING ERRCODE = '23503';
  END IF;

  v_total_cents := round(p_total_amount * 100)::BIGINT;
  v_base_cents := floor(v_total_cents::NUMERIC / p_installments)::BIGINT;
  v_remainder := v_total_cents - (v_base_cents * p_installments);
  v_purchase_day := EXTRACT(DAY FROM p_purchase_date)::INTEGER;

  INSERT INTO public.credit_card_purchases (
    user_id, credit_card_id, category_id, description, total_amount, purchase_date, installments
  ) VALUES (
    v_user_id, p_credit_card_id, p_category_id, btrim(p_description), p_total_amount, p_purchase_date, p_installments
  )
  RETURNING id INTO v_purchase_id;

  FOR v_index IN 1..p_installments LOOP
    v_month_start := (date_trunc('month', p_purchase_date) + ((v_index - 1) * interval '1 month'))::DATE;
    v_month_end := ((v_month_start + interval '1 month') - interval '1 day')::DATE;
    v_installment_date := make_date(
      EXTRACT(YEAR FROM v_month_start)::INTEGER,
      EXTRACT(MONTH FROM v_month_start)::INTEGER,
      LEAST(v_purchase_day, EXTRACT(DAY FROM v_month_end)::INTEGER)
    );
    v_installment_cents := v_base_cents + CASE WHEN v_index = 1 THEN v_remainder ELSE 0 END;

    INSERT INTO public.transactions (
      user_id,
      description,
      amount,
      type,
      category_id,
      account_id,
      credit_card_id,
      purchase_id,
      bill_id,
      date,
      payment_method,
      notes,
      recurrence,
      installment_number,
      installment_total
    ) VALUES (
      v_user_id,
      CASE WHEN p_installments > 1 THEN format('%s (%s/%s)', btrim(p_description), v_index, p_installments) ELSE btrim(p_description) END,
      v_installment_cents::NUMERIC / 100,
      'expense',
      p_category_id,
      NULL,
      p_credit_card_id,
      v_purchase_id,
      NULL,
      v_installment_date,
      'credito',
      p_notes,
      'none',
      CASE WHEN p_installments > 1 THEN v_index ELSE NULL END,
      CASE WHEN p_installments > 1 THEN p_installments ELSE NULL END
    );
  END LOOP;

  RETURN v_purchase_id;
END;
$$;

REVOKE ALL ON FUNCTION public.force_authenticated_owner() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.force_authenticated_owner() TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.guard_account_delete() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.guard_account_delete() TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.guard_category_delete() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.guard_category_delete() TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.guard_card_delete() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.guard_card_delete() TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.guard_purchase_delete() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.guard_purchase_delete() TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.guard_bill_delete() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.guard_bill_delete() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.create_card_purchase_with_installments(UUID, UUID, TEXT, NUMERIC, DATE, INTEGER, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_card_purchase_with_installments(UUID, UUID, TEXT, NUMERIC, DATE, INTEGER, TEXT) TO authenticated, service_role;

-- Keep service-role access for trusted operational tooling.
GRANT ALL ON TABLE public.profiles, public.accounts, public.categories, public.credit_cards,
  public.credit_card_purchases, public.bills, public.transactions, public.goals TO service_role;
