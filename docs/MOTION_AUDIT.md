# FINANZZI Motion & Loading Audit

Issue: #10

This checklist applies whenever a user-facing screen is added or changed.

## Required states

For each asynchronous surface, verify:

- loading state with a layout-preserving skeleton or progress indicator;
- success/content state;
- empty state where a collection can be empty;
- error state with a recovery path where the operation can fail;
- disabled/pending state for mutating controls;
- reduced-motion behavior.

## Shared primitives

- `Reveal`: occasional viewport entry for meaningful hierarchy.
- `Skeleton`: layout-preserving async placeholder with reduced-motion support.
- `NavigationLoading`: indeterminate route activity indicator, never a fake percentage.
- `AsyncSurface`: consistent loading/empty/error/content branching.
- `LazyImage`: progressive image loading with opacity-only reveal.

## Frequency gate

- High-frequency controls: instant or nearly instant.
- Navigation/state changes: short and calm.
- Occasional explanatory surfaces: subtle entry motion is allowed.
- Never animate every element simply because it mounted.

## Performance

Use transform and opacity for motion. Avoid layout animation where a transform can communicate the same state. Non-critical media should lazy-load when it does not delay the user's primary task.

## Current rollout

- Dashboard: skeleton state already present.
- Navigation: activity indicator already present.
- Landing: viewport reveal and progressive product image loading.
- Remaining routes must be audited incrementally before large visual refactors so loading/error/empty states are not lost.
