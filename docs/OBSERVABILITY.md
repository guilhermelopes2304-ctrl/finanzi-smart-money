# FINANZZI Observability

FINANZZI uses an OTLP-compatible browser telemetry foundation so the product can send lightweight traces to an OpenTelemetry Collector or an OTLP-compatible backend without coupling application code to a vendor.

## Configuration

Set these public client variables in the deployment environment:

```text
VITE_OTEL_EXPORTER_OTLP_ENDPOINT=https://<collector>/v1/traces
VITE_OTEL_SERVICE_NAME=finanzzi-web
```

The telemetry client does nothing when the endpoint is absent, so local development remains silent by default.

## Captured signals

- Application bootstrap.
- Unhandled browser errors.
- Unhandled promise rejections.
- Root UI error-boundary failures.
- Basic navigation timing metrics.

The implementation intentionally excludes raw transaction descriptions, amounts, account/card values, access tokens, credentials, and unnecessary personal data.

## Vendor backends

The OTLP endpoint can terminate in an OpenTelemetry Collector and then export to Sentry, Datadog, New Relic, or another OTLP-compatible backend. Keep provider credentials server-side/collector-side; never place service secrets in `VITE_*` variables.

See Issue #3 for the implementation scope and production acceptance criteria.
