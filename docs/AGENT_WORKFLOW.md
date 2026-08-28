# FINANZZI Agent Workflow

All work follows: GitHub Issue → dedicated branch → Pull Request referencing the Issue → CI → preview/deploy → published-result verification → merge.

Every correction, improvement, refactor with user impact, infrastructure change, or new feature MUST start as a GitHub Issue. Do not implement directly on `main`. Every PR description MUST reference its Issue with `Closes #N`, `Fixes #N`, or `Refs #N` and record scope, risks, validation, and deployment status.

Never rewrite published history used by Lovable (no force-push/rebase/amend/squash of published commits).

## UI quality

Use https://github.com/kylezantos/design-principles as the Motion Principles reference when accessible. Do not invent unavailable guidance. Async/lazy surfaces need an appropriate skeleton/loading state; non-critical content should use lazy loading where useful; provide purposeful entry/exit/state/loading/progress transitions; prefer transform/opacity; respect `prefers-reduced-motion`.

## Observability

Use an explicit production telemetry strategy. Prefer OpenTelemetry plus a compatible error/performance backend such as Sentry, Datadog, or New Relic. Never send secrets, credentials, raw financial records, or unnecessary PII.

## Quality/testing

Use TypeScript with lint/format gates. Evaluate Biome, Commitlint, Knip, Arch-contract, and Stryker/Stryke for compatibility. Maintain unit, integration, and Playwright E2E coverage; use Codecov when coverage upload is configured; introduce mutation testing progressively.

## Definition of Done

Issue exists; dedicated PR exists and references it; relevant CI gates pass; build succeeds; preview/deployment is published; affected UI/flow is verified in the published environment; no unrelated financial/security behavior changed.
