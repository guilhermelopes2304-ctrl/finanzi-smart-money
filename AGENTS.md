<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# FINANZZI Engineering Rules

## 1. Work tracking and delivery

- Every bug fix, improvement, refactor with user impact, infrastructure change, or new feature MUST start as a GitHub Issue.
- Every implementation MUST be delivered through a Pull Request. Do not push implementation commits directly to `main`.
- Every PR description MUST reference its Issue using `Closes #N`, `Fixes #N`, or `Refs #N` as appropriate.
- A PR must state scope, affected areas, risks, validation performed, and deployment/preview status.
- Use dedicated branches for each task. Keep commits small and coherent.
- Never force-push, rebase, amend, or squash already-published history when doing so would rewrite history used by Lovable.
- `main` is the production branch. `feat/finanzzi-redesign-final` is the active redesign/integration branch unless a newer project decision explicitly replaces it.
- Deploy changes from PRs/previews and validate the published result before declaring a task complete.
- Do not modify Supabase, Auth, RLS, migrations, billing, or financial calculations without a dedicated Issue and explicit validation of the affected behavior.

## 2. Product and visual guardrails

- Official FINANZZI identity is orange + black: primary `#FF5A1F`, black `#111111`, white `#FFFFFF`, neutral gray `#F4F4F4` and suitable dark neutrals.
- Do not reintroduce the previous green-first visual identity unless a future Issue explicitly changes the brand direction.
- Visual direction: premium fintech, inspired by the clarity and product focus of Banco Inter and the editorial/product presentation rhythm associated with Pierre, without copying either product.
- No mascot, character, avatar, face, generic AI chat bubble, neon, technological gradient, or decorative glow unless explicitly approved by a new Issue.
- Preserve mobile-first usability and avoid horizontal overflow.

## 3. Motion Principles

- Apply the Motion Principles reference at `https://github.com/kylezantos/design-principles` when implementing UI motion. If the reference is unavailable, do not invent its contents; follow the principles recorded in the related Issue and document any assumptions.
- UI that waits for asynchronous content should expose an appropriate skeleton or loading state.
- Use lazy loading for non-critical images/content when it improves initial load without harming UX.
- Provide smooth, purposeful entry/exit transitions and state transitions where they improve comprehension.
- Show progress for multi-step or long-running operations where meaningful.
- Prefer transform/opacity-based motion for performant transitions; avoid gratuitous continuous motion.
- Respect `prefers-reduced-motion` and provide a reduced/no-motion path.
- Motion must communicate hierarchy, causality, feedback, or state — never exist only as decoration.

## 4. Observability

- Production behavior must be observable through an explicit telemetry strategy.
- Prefer OpenTelemetry for vendor-neutral tracing/instrumentation and use an error/performance backend such as Sentry, Datadog, or New Relic according to the implementation Issue and stack compatibility.
- Never send passwords, access tokens, service-role keys, raw financial records, or unnecessary PII to telemetry.
- Separate development, preview, and production telemetry.
- Document required environment variables and keep secrets out of source control.

## 5. Code quality

- TypeScript-first; avoid `any` unless there is a documented reason.
- Formatting and linting are mandatory gates.
- Evaluate and adopt the requested quality tooling where compatible: Biome, Commitlint, Knip, Arch-contract, and Stryker/Stryke. Do not add redundant tools without a documented reason.
- Keep dependencies minimal and remove dead code/dependencies when identified.
- Prefer automated checks in CI over manual-only validation.

## 6. Testing and CI

- Maintain unit, integration, and end-to-end coverage appropriate to the feature.
- Use Playwright for critical browser journeys and regression coverage.
- Publish coverage to Codecov when CI coverage is configured.
- Mutation testing should be introduced progressively with Stryker/Stryke on critical logic.
- PRs should not be considered complete when the relevant typecheck/lint/test/build gates are failing.
- Test loading, error, empty, success, disabled, responsive, and reduced-motion states for user-facing flows where applicable.

## 7. Definition of Done

A task is complete only when:

1. The related GitHub Issue exists and is referenced by the PR.
2. Implementation is in a dedicated branch and PR.
3. Relevant automated checks pass.
4. Build succeeds.
5. Preview/deployment is published successfully.
6. The affected UI/flow is verified in the published environment.
7. No unrelated financial/security behavior was changed.
8. Documentation/agent instructions are updated when the engineering standard itself changes.
