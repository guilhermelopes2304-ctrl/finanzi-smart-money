# FINANZZI Observability

FINANZZI uses an OpenTelemetry-compatible browser telemetry payload. Telemetry is optional and is disabled for export until an OTLP endpoint is configured.

## Environment

```
VITE_OTEL_ENABLED=true
VITE_OTEL_EXPORTER_OTLP_ENDPOINT=https://collector.example.com
VITE_OTEL_SERVICE_NAME=finanzzi-web
VITE_OTEL_SAMPLE_RATE=1
VITE_APP_VERSION=optional-build-version
```

The exporter accepts a collector base URL and sends traces to `/v1/traces`. Use an HTTPS endpoint in preview/production. Local HTTP is accepted only for `localhost` and `127.0.0.1`.

A compatible collector can forward data to an observability backend such as Sentry, Datadog, or New Relic. The product remains vendor-neutral at the browser boundary.

## Captured signals

- application bootstrap;
- route views using pathnames only;
- browser errors by error type, not error message/stack;
- unhandled rejection type;
- navigation timing and transfer size;
- explicit operational events through `captureTelemetry`.

## Privacy boundary

Telemetry sanitization rejects attributes whose keys suggest secrets, credentials, authentication material, PII, or raw financial data. Examples include password, token, secret, authorization, cookie, email, phone, CPF, card, account, transaction, amount, balance, income, expense, raw content, description, message, stack, and name.

Do not pass user-entered financial text or identifiers to `captureTelemetry`.

## Environments

Keep development, preview, and production endpoints separated at deployment configuration level. Never commit telemetry credentials or collector secrets to the repository. Browser `VITE_*` values are public by design.

## Failure mode

Telemetry is best-effort. Export failures are swallowed and must never break financial or product flows.
