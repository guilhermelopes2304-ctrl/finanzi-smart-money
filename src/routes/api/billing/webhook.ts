import { createFileRoute } from "@tanstack/react-router";
import { handleBillingWebhookRequest } from "@/lib/billing-webhook.server";

export const Route = createFileRoute("/api/billing/webhook")({
  server: {
    handlers: {
      POST: ({ request }) => handleBillingWebhookRequest(request),
    },
  },
});
