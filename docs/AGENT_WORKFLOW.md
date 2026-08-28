# FINANZZI Agent Workflow

This project uses GitHub Issues + dedicated branches + Pull Requests as the delivery protocol for every correction, improvement, refactor with user impact, infrastructure change, and new feature.

1. Create or update a GitHub Issue before implementation.
2. Create a dedicated branch from the intended base branch.
3. Implement only the Issue scope on that branch.
4. Open a Pull Request and reference the Issue in the PR description with `Closes #N`, `Fixes #N`, or `Refs #N`.
5. Run the relevant quality, lint, unit, integration, E2E, and build checks.
6. Deploy through the PR/preview workflow and verify the published result before declaring completion.
7. Merge only after the relevant gates pass.
8. Never rewrite published history used by Lovable (no force-push/rebase/amend/squash of already-published commits).

## UI quality standard

Use the Motion Principles reference at https://github.com/kylezantos/design-principles when available. Every asynchronous or lazy UI surface should have an appropriate skeleton/loading state; non-critical media should use lazy loading when beneficial; transitions should cover meaningful entry, exit, state, loading, and progress states; motion must be purposeful, performant, and respect `prefers-reduced-motion`.

## Observability standard

Production must have an explicit telemetry strategy. Prefer OpenTelemetry for vendor-neutral instrumentation plus an error/performance backend such as Sentry, Datadog, or New Relic. Never send secrets, credentials, or unnecessary raw financial/PII data to telemetry.

## Quality and testing standard

Use TypeScript, lint/format gates, and evaluate Biome, Commitlint, Knip, Arch-contract, and Stryker/Stryke for compatibility. Maintain unit, integration, and Playwright E2E coverage; publish coverage to Codecov when configured. Mutation testing may be progressive as coverage matures.

## Definition of Done

A task is complete only when its Issue exists, the implementation is in a dedicated PR, relevant automated gates pass, build succeeds, preview/deployment is published, and the affected user-facing result is verified in the published environment.
