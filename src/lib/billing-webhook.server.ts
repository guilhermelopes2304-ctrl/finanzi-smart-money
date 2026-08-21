import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";
import {
  billingEventFromHubla,
  subscriptionPatchFromWebhook,
  type BillingWebhookEvent,
  type HublaWebhookPayload,
} from "@/lib/billing";

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

function verifyHublaToken(receivedToken: string | null) {
  const configuredToken = process.env["HUBLA_WEBHOOK_TOKEN"];
  return Boolean(
    configuredToken && receivedToken && signaturesMatch(configuredToken, receivedToken),
  );
}

function isHublaRequest(request: Request) {
  return Boolean(
    request.headers.get("x-hubla-token") || request.headers.get("x-hubla-idempotency"),
  );
}

async function findOrCreateUserByEmail(email: string, name?: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes("@")) return null;

  const admin = supabaseAdmin;
  const { data: existing, error: lookupError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  const matchedUser = existing.users.find(
    (candidate) => candidate.email?.toLowerCase() === normalizedEmail,
  );
  if (!lookupError && matchedUser) return matchedUser.id;

  const { data, error } = await admin.auth.admin.createUser({
    email: normalizedEmail,
    email_confirm: true,
    user_metadata: {
      name: name?.trim() || normalizedEmail.split("@")[0],
      source: "hubla",
      requires_password_setup: true,
    },
  });
  if (error || !data.user) {
    console.error("[Hubla] Unable to create Auth user", error?.message);
    return null;
  }
  return data.user.id;
}

async function resolveUserId(event: BillingWebhookEvent) {
  const admin = supabaseAdmin;
  const externalId = event.data.externalSubscriptionId ?? null;
  if (event.data.userId) return event.data.userId;

  if (externalId) {
    const { data: subscription } = await admin
      .from("subscriptions")
      .select("user_id")
      .eq("external_subscription_id", externalId)
      .maybeSingle();
    if (subscription?.user_id) return subscription.user_id;
  }

  if (event.data.buyerEmail && ["payment_approved", "subscription_created"].includes(event.type)) {
    return findOrCreateUserByEmail(event.data.buyerEmail, event.data.buyerName);
  }

  return null;
}

async function processNormalizedEvent(event: BillingWebhookEvent, rawPayload: unknown) {
  const admin = supabaseAdmin;
  const { data: existing } = await admin
    .from("billing_webhook_events")
    .select("id, status")
    .eq("id", event.id)
    .maybeSingle();
  if (existing?.status === "processed") return { ok: true, duplicate: true };

  const userId = await resolveUserId(event);
  if (!userId) {
    await admin.from("billing_webhook_events").upsert(
      {
        id: event.id,
        event_type: event.type,
        user_id: null,
        payload: rawPayload as Json,
        status: "ignored",
        error_message: "No FINANZZI user could be resolved from the event",
      },
      { onConflict: "id" },
    );
    return { ok: true, ignored: true };
  }

  await admin.from("billing_webhook_events").upsert(
    {
      id: event.id,
      event_type: event.type,
      user_id: userId,
      payload: rawPayload as Json,
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
    throw new Error(subscriptionError.message);
  }

  await admin
    .from("billing_webhook_events")
    .update({ status: "processed", processed_at: new Date().toISOString() })
    .eq("id", event.id);
  return { ok: true };
}

export async function handleBillingWebhookRequest(request: Request) {
  const payload = await request.text();
  const hublaRequest = isHublaRequest(request);

  if (hublaRequest) {
    if (!verifyHublaToken(request.headers.get("x-hubla-token"))) {
      return Response.json({ error: "Invalid Hubla webhook token" }, { status: 401 });
    }

    let hublaPayload: HublaWebhookPayload;
    try {
      hublaPayload = JSON.parse(payload) as HublaWebhookPayload;
    } catch {
      return Response.json({ error: "Invalid Hubla webhook payload" }, { status: 400 });
    }

    const idempotencyKey = request.headers.get("x-hubla-idempotency");
    if (!idempotencyKey)
      return Response.json({ error: "Missing Hubla idempotency key" }, { status: 422 });

    const event = billingEventFromHubla(hublaPayload, idempotencyKey);
    if (!event)
      return Response.json({ ok: true, ignored: true, reason: "Unsupported Hubla event" });

    try {
      return Response.json(await processNormalizedEvent(event, hublaPayload));
    } catch (error) {
      console.error("[Hubla] Webhook processing failed", error);
      return Response.json({ error: "Unable to process Hubla webhook" }, { status: 500 });
    }
  }

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

  try {
    return Response.json(await processNormalizedEvent(event, event));
  } catch (error) {
    console.error("[Billing] Webhook processing failed", error);
    return Response.json({ error: "Unable to update subscription" }, { status: 500 });
  }
}
