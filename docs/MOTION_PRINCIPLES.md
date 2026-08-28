# FINANZZI Motion Principles

Reference: https://github.com/kylezantos/design-motion-principles

The upstream skill defines Create and Audit modes and emphasizes purposeful motion, context-aware frequency, accessibility, and performance. It maps productivity/SaaS work primarily toward restraint and production polish, with selective experimentation. The key rules adopted here are:

- Animate for comprehension, feedback, hierarchy, causality, or state — not decoration.
- Use a frequency gate: frequent actions should be instant or nearly instant; occasional actions can use subtle transitions.
- Prefer short UI motion (roughly under 300ms for frequent/productivity interactions) and context-appropriate easing.
- Every animation must have a `prefers-reduced-motion` path.
- Avoid animation fingerprints associated with low-quality generated interfaces: stagger spam, universal hover scaling, pulsing attention effects, bouncy utility controls, and uniform motion on every mount.
- Async content should expose an appropriate loading/skeleton state; non-critical content should lazy-load when useful.
- Loading/progress motion must communicate actual state and should not imply progress that is not real.

Source checked on 2026-08-28 against the public upstream repository and SKILL.md.
