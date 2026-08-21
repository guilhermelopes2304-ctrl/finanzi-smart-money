-- FINANZZI FASE 0 — READ-ONLY DATA INTEGRITY AUDIT
-- This file intentionally contains SELECTs only.
-- Run with a database-admin/service-role connection before validating the
-- NOT VALID constraints from the security migration. Do not modify the output.

-- 1. Inventory and ownership counts.
SELECT 'profiles' AS table_name, count(*) AS row_count FROM public.profiles
UNION ALL SELECT 'accounts', count(*) FROM public.accounts
UNION ALL SELECT 'categories', count(*) FROM public.categories
UNION ALL SELECT 'credit_cards', count(*) FROM public.credit_cards
UNION ALL SELECT 'credit_card_purchases', count(*) FROM public.credit_card_purchases
UNION ALL SELECT 'bills', count(*) FROM public.bills
UNION ALL SELECT 'transactions', count(*) FROM public.transactions
UNION ALL SELECT 'goals', count(*) FROM public.goals;

SELECT 'accounts' AS table_name, user_id, count(*) AS row_count
FROM public.accounts GROUP BY user_id ORDER BY table_name, user_id;
SELECT 'categories' AS table_name, user_id, count(*) AS row_count
FROM public.categories GROUP BY user_id ORDER BY table_name, user_id;
SELECT 'credit_cards' AS table_name, user_id, count(*) AS row_count
FROM public.credit_cards GROUP BY user_id ORDER BY table_name, user_id;
SELECT 'credit_card_purchases' AS table_name, user_id, count(*) AS row_count
FROM public.credit_card_purchases GROUP BY user_id ORDER BY table_name, user_id;
SELECT 'bills' AS table_name, user_id, count(*) AS row_count
FROM public.bills GROUP BY user_id ORDER BY table_name, user_id;
SELECT 'transactions' AS table_name, user_id, count(*) AS row_count
FROM public.transactions GROUP BY user_id ORDER BY table_name, user_id;
SELECT 'goals' AS table_name, user_id, count(*) AS row_count
FROM public.goals GROUP BY user_id ORDER BY table_name, user_id;

-- 2. Cross-user references. Every result must be empty before VALIDATE CONSTRAINT.
SELECT t.id, t.user_id AS transaction_user_id, t.account_id, a.user_id AS account_user_id
FROM public.transactions t JOIN public.accounts a ON a.id = t.account_id
WHERE t.user_id IS DISTINCT FROM a.user_id;

SELECT t.id, t.user_id AS transaction_user_id, t.category_id, c.user_id AS category_user_id
FROM public.transactions t JOIN public.categories c ON c.id = t.category_id
WHERE t.user_id IS DISTINCT FROM c.user_id;

SELECT t.id, t.user_id AS transaction_user_id, t.credit_card_id, c.user_id AS card_user_id
FROM public.transactions t JOIN public.credit_cards c ON c.id = t.credit_card_id
WHERE t.user_id IS DISTINCT FROM c.user_id;

SELECT t.id, t.user_id AS transaction_user_id, t.purchase_id, p.user_id AS purchase_user_id
FROM public.transactions t JOIN public.credit_card_purchases p ON p.id = t.purchase_id
WHERE t.user_id IS DISTINCT FROM p.user_id;

SELECT t.id, t.user_id AS transaction_user_id, t.bill_id, b.user_id AS bill_user_id
FROM public.transactions t JOIN public.bills b ON b.id = t.bill_id
WHERE t.user_id IS DISTINCT FROM b.user_id;

SELECT p.id, p.user_id AS purchase_user_id, p.credit_card_id, c.user_id AS card_user_id
FROM public.credit_card_purchases p JOIN public.credit_cards c ON c.id = p.credit_card_id
WHERE p.user_id IS DISTINCT FROM c.user_id;

SELECT p.id, p.user_id AS purchase_user_id, p.category_id, c.user_id AS category_user_id
FROM public.credit_card_purchases p JOIN public.categories c ON c.id = p.category_id
WHERE p.user_id IS DISTINCT FROM c.user_id;

SELECT b.id, b.user_id AS bill_user_id, b.account_id, a.user_id AS account_user_id
FROM public.bills b JOIN public.accounts a ON a.id = b.account_id
WHERE b.user_id IS DISTINCT FROM a.user_id;

SELECT b.id, b.user_id AS bill_user_id, b.category_id, c.user_id AS category_user_id
FROM public.bills b JOIN public.categories c ON c.id = b.category_id
WHERE b.user_id IS DISTINCT FROM c.user_id;

-- 3. Orphans and broken ownership roots.
SELECT 'accounts_without_auth_user' AS issue, count(*) AS row_count
FROM public.accounts a LEFT JOIN auth.users u ON u.id = a.user_id WHERE u.id IS NULL
UNION ALL SELECT 'categories_without_auth_user', count(*) FROM public.categories c LEFT JOIN auth.users u ON u.id = c.user_id WHERE u.id IS NULL
UNION ALL SELECT 'credit_cards_without_auth_user', count(*) FROM public.credit_cards c LEFT JOIN auth.users u ON u.id = c.user_id WHERE u.id IS NULL
UNION ALL SELECT 'purchases_without_auth_user', count(*) FROM public.credit_card_purchases p LEFT JOIN auth.users u ON u.id = p.user_id WHERE u.id IS NULL
UNION ALL SELECT 'bills_without_auth_user', count(*) FROM public.bills b LEFT JOIN auth.users u ON u.id = b.user_id WHERE u.id IS NULL
UNION ALL SELECT 'transactions_without_auth_user', count(*) FROM public.transactions t LEFT JOIN auth.users u ON u.id = t.user_id WHERE u.id IS NULL
UNION ALL SELECT 'goals_without_auth_user', count(*) FROM public.goals g LEFT JOIN auth.users u ON u.id = g.user_id WHERE u.id IS NULL;

SELECT 'transaction_account_orphan' AS issue, count(*) AS row_count
FROM public.transactions t LEFT JOIN public.accounts a ON a.id = t.account_id
WHERE t.account_id IS NOT NULL AND a.id IS NULL
UNION ALL SELECT 'transaction_category_orphan', count(*) FROM public.transactions t LEFT JOIN public.categories c ON c.id = t.category_id WHERE t.category_id IS NOT NULL AND c.id IS NULL
UNION ALL SELECT 'transaction_card_orphan', count(*) FROM public.transactions t LEFT JOIN public.credit_cards c ON c.id = t.credit_card_id WHERE t.credit_card_id IS NOT NULL AND c.id IS NULL
UNION ALL SELECT 'transaction_purchase_orphan', count(*) FROM public.transactions t LEFT JOIN public.credit_card_purchases p ON p.id = t.purchase_id WHERE t.purchase_id IS NOT NULL AND p.id IS NULL
UNION ALL SELECT 'transaction_bill_orphan', count(*) FROM public.transactions t LEFT JOIN public.bills b ON b.id = t.bill_id WHERE t.bill_id IS NOT NULL AND b.id IS NULL
UNION ALL SELECT 'purchase_card_orphan', count(*) FROM public.credit_card_purchases p LEFT JOIN public.credit_cards c ON c.id = p.credit_card_id WHERE c.id IS NULL
UNION ALL SELECT 'bill_account_orphan', count(*) FROM public.bills b LEFT JOIN public.accounts a ON a.id = b.account_id WHERE b.account_id IS NOT NULL AND a.id IS NULL
UNION ALL SELECT 'bill_category_orphan', count(*) FROM public.bills b LEFT JOIN public.categories c ON c.id = b.category_id WHERE b.category_id IS NOT NULL AND c.id IS NULL;

-- 4. Profile identity divergence. This is a report only; it does not sync values.
SELECT p.id, p.email AS profile_email, u.email AS auth_email
FROM public.profiles p JOIN auth.users u ON u.id = p.id
WHERE p.email IS DISTINCT FROM COALESCE(u.email, '');

SELECT u.id AS auth_user_id
FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 5. Domain candidates that would block CHECK validation.
SELECT 'transactions.amount_nonpositive' AS issue, count(*) AS row_count
FROM public.transactions WHERE amount <= 0
UNION ALL SELECT 'bills.amount_nonpositive', count(*) FROM public.bills WHERE amount <= 0
UNION ALL SELECT 'purchases.amount_nonpositive', count(*) FROM public.credit_card_purchases WHERE total_amount <= 0
UNION ALL SELECT 'cards.credit_limit_negative', count(*) FROM public.credit_cards WHERE credit_limit < 0
UNION ALL SELECT 'goals.amount_negative', count(*) FROM public.goals WHERE target_amount < 0 OR current_amount < 0
UNION ALL SELECT 'profiles.income_negative', count(*) FROM public.profiles WHERE monthly_income < 0
UNION ALL SELECT 'cards.closing_day_invalid', count(*) FROM public.credit_cards WHERE closing_day NOT BETWEEN 1 AND 31
UNION ALL SELECT 'cards.due_day_invalid', count(*) FROM public.credit_cards WHERE due_day NOT BETWEEN 1 AND 31
UNION ALL SELECT 'purchases.installments_invalid', count(*) FROM public.credit_card_purchases WHERE installments NOT BETWEEN 1 AND 72
UNION ALL SELECT 'accounts.type_empty', count(*) FROM public.accounts WHERE btrim(type) = ''
UNION ALL SELECT 'categories.kind_unknown', count(*) FROM public.categories WHERE kind NOT IN ('income', 'expense', 'both')
UNION ALL SELECT 'transactions.type_unknown', count(*) FROM public.transactions WHERE type NOT IN ('income', 'expense')
UNION ALL SELECT 'transactions.payment_method_unknown', count(*) FROM public.transactions WHERE payment_method NOT IN ('dinheiro', 'pix', 'debito', 'credito', 'transferencia', 'outro')
UNION ALL SELECT 'transactions.recurrence_unknown', count(*) FROM public.transactions WHERE recurrence NOT IN ('none', 'weekly', 'monthly', 'yearly')
UNION ALL SELECT 'bills.recurrence_unknown', count(*) FROM public.bills WHERE recurrence NOT IN ('none', 'weekly', 'monthly', 'yearly')
UNION ALL SELECT 'bills.status_unknown', count(*) FROM public.bills WHERE status NOT IN ('pending', 'paid', 'late')
UNION ALL SELECT 'bills.paid_without_date', count(*) FROM public.bills WHERE status = 'paid' AND paid_at IS NULL;

-- 6. Parcel consistency candidates.
SELECT t.id, t.user_id, t.purchase_id, t.credit_card_id, t.installment_number, t.installment_total
FROM public.transactions t
WHERE (t.installment_number IS NULL) <> (t.installment_total IS NULL)
   OR (t.installment_total IS NOT NULL AND (t.installment_total NOT BETWEEN 2 AND 72 OR t.installment_number NOT BETWEEN 1 AND t.installment_total));

SELECT p.id, p.user_id, p.installments, count(t.id) AS transaction_count,
       COALESCE(sum(t.amount), 0) AS transaction_total, p.total_amount
FROM public.credit_card_purchases p
LEFT JOIN public.transactions t ON t.purchase_id = p.id
GROUP BY p.id, p.user_id, p.installments, p.total_amount
HAVING count(t.id) <> p.installments
    OR COALESCE(sum(t.amount), 0) <> p.total_amount;

-- 7. Constraints currently installed and whether they are validated.
SELECT n.nspname AS schema_name, c.relname AS table_name, con.conname,
       con.contype, con.convalidated, pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('profiles', 'accounts', 'categories', 'credit_cards',
                    'credit_card_purchases', 'bills', 'transactions', 'goals')
ORDER BY c.relname, con.conname;

-- 8. Dependency counts used to review delete behavior before changing actions.
SELECT 'accounts_with_bills' AS dependency, count(*) AS row_count
FROM public.accounts a WHERE EXISTS (SELECT 1 FROM public.bills b WHERE b.account_id = a.id)
UNION ALL SELECT 'accounts_with_transactions', count(*) FROM public.accounts a WHERE EXISTS (SELECT 1 FROM public.transactions t WHERE t.account_id = a.id)
UNION ALL SELECT 'categories_with_bills', count(*) FROM public.categories c WHERE EXISTS (SELECT 1 FROM public.bills b WHERE b.category_id = c.id)
UNION ALL SELECT 'categories_with_transactions', count(*) FROM public.categories c WHERE EXISTS (SELECT 1 FROM public.transactions t WHERE t.category_id = c.id)
UNION ALL SELECT 'cards_with_purchases', count(*) FROM public.credit_cards c WHERE EXISTS (SELECT 1 FROM public.credit_card_purchases p WHERE p.credit_card_id = c.id)
UNION ALL SELECT 'cards_with_transactions', count(*) FROM public.credit_cards c WHERE EXISTS (SELECT 1 FROM public.transactions t WHERE t.credit_card_id = c.id)
UNION ALL SELECT 'purchases_with_transactions', count(*) FROM public.credit_card_purchases p WHERE EXISTS (SELECT 1 FROM public.transactions t WHERE t.purchase_id = p.id)
UNION ALL SELECT 'bills_with_transactions', count(*) FROM public.bills b WHERE EXISTS (SELECT 1 FROM public.transactions t WHERE t.bill_id = b.id);
