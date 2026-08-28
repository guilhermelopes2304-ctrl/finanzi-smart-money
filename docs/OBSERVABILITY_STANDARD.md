# FINANZZI Observability Standard

Production telemetry must be explicit, privacy-conscious, and separated by environment. Prefer OpenTelemetry as the instrumentation layer and add a compatible error/performance backend (Sentry, Datadog, or New Relic) according to the implementation Issue. Never collect passwords, access tokens, service-role keys, or unnecessary raw financial/PII data.
