export type ProductEvent =
  | "signup_completed"
  | "first_transaction"
  | "first_goal"
  | "first_card"
  | "quick_entry_used"
  | "fin_used"
  | "spend_capacity_viewed"
  | "insight_viewed"
  | "pro_viewed"
  | "checkout_started"
  | "subscription_moment_shared"
  | "installment_moment_shared"
  | "category_moment_shared"
  | "fin_month_moment_shared"
  | "commitment_reminder_viewed";

const STORAGE_KEY = "finanzzi-product-events";

type StoredEvent = { name: ProductEvent; at: string };

/**
 * Product analytics stays local for now. It deliberately stores only event names
 * and timestamps, never email, user ids, amounts or descriptions.
 */
export function trackProductEvent(name: ProductEvent) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const events = raw ? (JSON.parse(raw) as StoredEvent[]) : [];
    const next = [...events, { name, at: new Date().toISOString() }].slice(-100);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("finanzzi:product-event", { detail: { name } }));
  } catch {
    // Analytics must never block a financial operation.
  }
}

export function getTrackedProductEvents(): StoredEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredEvent[]) : [];
  } catch {
    return [];
  }
}
