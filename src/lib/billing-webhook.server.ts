import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { subscriptionPatchFromWebhook, type BillingWebhookEvent } from "@/lib/billing";

function bytesToHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hmacSha256(secret: string, payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return bytesToHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
}

function signaturesMatch(expected: string, received: string) {
  const normalized = received
    .replace(/^sha256=/i, "")
    .trim()
    .toLowerCase();
  if (normalized.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected.charCodeAt(index) ^ normalized.charCodeAt(index);
  }
  return difference === 0;
}

export async function verifyBillingWebhookSignature(
  payload: string,
  receivedSignature: string | null,
) {
  const secret = process.env["BILLING_WEBHOOK_SECRET"];
  if (!secret || !receivedSignature) return false;
  return signaturesMatch(await hmacSha256(secret, payload), receivedSignature);
}

export async function handleBillingWebhookRequest(request: Request) {
  const payload = await request.text();
  if (!(await verifyBillingWebhookSignature(payload, request.headers.get("x-billing-signature")))) {
    return Response.json({ error: "Invalid billing webhook signature" }, { status: 401 });
  }

  let event: BillingWebhookEvent;
  try {
    event = JSON.parse(payload) as BillingWebhookEvent;
  } catch {
    return Response.json({ error: "Invalid billing webhook payload" }, { status: 400 });
  }
  if (!event.id || !event.type || !event.occurredAt) {
    return Response.json({ error: "Incomplete billing webhook payload" }, { status: 422 });
  }

  const admin = supabaseAdmin;
  const { data: existing } = await admin
    .from("billing_webhook_events")
    .select("id, status")
    .eq("id", event.id)
    .maybeSingle();
  if (existing?.status === "processed") return Response.json({ ok: true, duplicate: true });

  const externalId = event.data.externalSubscriptionId ?? null;
  let userId = event.data.userId ?? null;
  if (!userId && externalId) {
    const { data: subscription } = await admin
      .from("subscriptions")
      .select("user_id")
      .eq("external_subscription_id", externalId)
      .maybeSingle();
    userId = subscription?.user_id ?? null;
  }
  if (!userId) return Response.json({ error: "Webhook has no resolvable user" }, { status: 422 });

  await admin.from("billing_webhook_events").upsert(
    {
      id: event.id,
      event_type: event.type,
      user_id: userId,
      payload: event,
      status: "received",
    },
    { onConflict: "id" },
  );

  const patch = subscriptionPatchFromWebhook(event);
  const { error: subscriptionError } = await admin
    .from("subscriptions")
    .upsert({ user_id: userId, ...patch }, { onConflict: "user_id" });
  if (subscriptionError) {
    await admin
      .from("billing_webhook_events")
      .update({ status: "failed", error_message: subscriptionError.message })
      .eq("id", event.id);
    return Response.json({ error: "Unable to update subscription" }, { status: 500 });
  }

  await admin
    .from("billing_webhook_events")
    .update({ status: "processed", processed_at: new Date().toISOString() })
    .eq("id", event.id);
  return Response.json({ ok: true });
}
