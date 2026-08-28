# FINANZZI Observability

FINANZZI has an opt-in, vendor-neutral OTLP browser telemetry foundation. It can send lightweight application and browser signals to an OpenTelemetry Collector or another OTLP-compatible endpoint, which may then export to Sentry, Datadog, New Relic, or another backend.

## Configuration

```text
VITE_OTEL_EXPORTER_OTLP_ENDPOINT=https://<collector>/v1/traces
VITE_OTEL_SERVICE_NAME=finanzzi-web
```

Telemetry is disabled when the endpoint is absent and must never block product execution.

## Captured signals

- Application bootstrap.
- Unhandled browser errors.
- Unhandled promise rejections.
- Root UI error-boundary failures.
- Basic navigation timing.

Telemetry intentionally excludes raw transaction descriptions, amounts, account/card values, credentials, access tokens, service-role keys, and unnecessary PII.

Provider credentials belong in the collector/backend, never in public `VITE_*` variables.
