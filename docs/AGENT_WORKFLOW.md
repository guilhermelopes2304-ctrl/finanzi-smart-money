# FINANZZI Agent Workflow

All work follows: GitHub Issue → dedicated branch → Pull Request referencing the Issue → CI → preview/deploy → published-result verification → merge.

Every correction, improvement, refactor with user impact, infrastructure change, or new feature MUST start as a GitHub Issue. Do not implement directly on `main`. Every PR description MUST reference its Issue with `Closes #N`, `Fixes #N`, or `Refs #N` and record scope, risks, validation, and deployment status.

Never rewrite published history used by Lovable (no force-push/rebase/amend/squash of published commits).

## UI quality

Use the current upstream Motion Principles skill: `https://github.com/kylezantos/design-motion-principles`. Do not invent unavailable guidance. For async/lazy surfaces, use an appropriate skeleton/loading state; non-critical content should use lazy loading where useful; provide purposeful entry/exit/state/loading/progress transitions; prefer performant transforms/opacity; respect `prefers-reduced-motion`. Apply the frequency gate: high-frequency interactions should be instant or nearly instant, while occasional interactions can use subtle motion.

## Observability

Use an explicit production telemetry strategy. Prefer OpenTelemetry for vendor-neutral instrumentation plus a compatible backend such as Sentry, Datadog, or New Relic. Never send secrets, credentials, raw financial records, or unnecessary PII. Separate development, preview, and production telemetry.

## Quality/testing

Use TypeScript with lint/format gates. Evaluate and adopt, where compatible and useful, Biome, Commitlint, Knip, Arch-contract, and StrykerJS. Maintain unit, integration, and Playwright E2E coverage; upload coverage to Codecov when configured; introduce mutation testing progressively on critical business logic.

## Definition of Done

Issue exists; dedicated branch exists; PR references the Issue; relevant CI gates pass; build succeeds; preview/deployment is published; affected UI/flow is verified in the published environment; no unrelated financial/security behavior changed; documentation and agent instructions are updated when the standard itself changes.
