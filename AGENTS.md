<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
<!-- LOVABLE:END -->

# FINANZZI Engineering Rules

## Product
FINANZZI is a mobile-first personal finance PWA. The primary experience is a conversational Home where users register income and expenses in natural language and receive visual financial responses.

## Delivery
- Every bug fix, improvement, refactor, infrastructure change, or feature starts as a GitHub Issue and is delivered through a dedicated branch + PR.
- `main` is production. Never rewrite published history.
- Run relevant lint, typecheck, tests, and build before declaring completion.
- Never claim production readiness until the deployment is actually READY and the affected flow has been verified.

## Architecture and data safety
- Preserve the existing React/TypeScript/Tailwind/routing architecture.
- Reuse existing services and hooks before creating parallel data-access logic.
- Financial writes remain scoped to the authenticated `user_id` and respect Supabase RLS.
- Never expose or mutate another user's financial data.
- Never bypass authentication, RLS, authorization, billing, or financial calculation safeguards.
- Keep Home, History, Accounts, Cards, Goals, Summary, and Settings inside the shared application shell.

## UI/UX
- Mobile-first for iOS and Android PWAs; do not optimize for a single device.
- Authenticated shell uses `100dvh`/`100svh`, safe areas, and internal scrolling regions. Do not make the document the scrolling surface.
- Navigation is drawer-first. Do not reintroduce a bottom navigation bar unless explicitly requested.
- Dark-first FINANZZI identity: orange `#FF5A1F`, black `#111111`, white and charcoal surfaces.
- Gradients, blur, glow, and motion must create depth without visual noise or layout shifts.
- Composer stays anchored to the bottom safe area and must behave correctly with the mobile keyboard.
- Maintain accessible contrast, touch targets, keyboard behavior, and `prefers-reduced-motion` support.
- Avoid generic AI-dashboard aesthetics.

## Finance UX
- Natural-language suggestions fill the composer for editing before submission.
- History uses human-readable descriptions and categories; use `Geral`/`Outros` as presentation fallback instead of `Sem categoria`.
- Confirmation cards must reflect actual persisted transaction state.
- Undo/delete/edit actions must use the authenticated data layer and invalidate/refetch relevant financial queries.
- Currency defaults to BRL (`pt-BR`).

## Motion system
- Reuse `src/styles/finanzzi-motion.css` and shared primitives where possible.
- Prefer CSS transform/opacity transitions for decorative effects; use GSAP only when it materially improves an interaction.
- Animate for hierarchy, feedback, causality, loading, progress, or state—not decoration alone.
- Never use fake progress, continuous attention pulses, or animation that causes layout shift.
- Respect `prefers-reduced-motion`.

## Quality gates
- TypeScript-first; avoid `any` without justification.
- Formatting, linting, typecheck, tests, and build are mandatory relevant gates.
- Use Playwright for critical browser journeys and regression coverage when configured.
- Prefer automated CI checks over manual-only validation.
- Test loading, error, empty, success, disabled, responsive, keyboard/safe-area, and reduced-motion states for user-facing flows where applicable.
- Keep dependencies minimal and remove dead code when identified.

## Definition of Done
1. Issue exists and is referenced by the PR.
2. Implementation is isolated in a branch and PR.
3. Relevant automated checks pass.
4. Build succeeds.
5. Preview/deployment succeeds.
6. Published affected flow is verified.
7. No unrelated financial/security behavior is changed.
8. Agent instructions are updated when the engineering standard changes.
