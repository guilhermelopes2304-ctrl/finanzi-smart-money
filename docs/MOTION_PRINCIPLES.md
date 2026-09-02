# FINANZZI Motion & Interaction System

This document defines the production rules for UI motion and interaction.

## Core rule

Motion must explain a state change, preserve spatial continuity, provide feedback, or guide attention. Decorative motion is rejected.

## Frequency gate

- Repeated actions: instant or fast.
- Common controls: 90–160ms.
- Menus, popovers and local layout changes: about 220ms.
- Structural transitions: up to about 320ms.
- Landing storytelling may be slower; the product UI may not.

## Tokens

The implementation lives in `src/styles.css`.

- `--motion-instant: 90ms`
- `--motion-fast: 160ms`
- `--motion-normal: 220ms`
- `--motion-slow: 320ms`

Use `--ease-enter` for entrances, `--ease-exit` for departures, and `--ease-standard` for local state changes.

## Interaction primitives

### Press feedback

Interactive controls use `fin-interactive` and `fin-pressable`. Press feedback is a small compression, never a bounce.

### Cards

Cards may lift by 1px on hover only when the device supports hover. Cards do not animate repeatedly on touch devices.

### Dialogs

Dialogs fade with a subtle 0.985→1 scale transition. They should feel anchored and calm rather than zoom theatrically.

### Sheets

Mobile sheets use Vaul's gesture system. The FINANZZI wrapper preserves drag behavior, adds a restrained overlay, safe viewport height, and a clear drag affordance.

## Continuity

Prefer transforming an existing object into its next state over unmounting it and mounting an unrelated replacement.

Use local layout transitions for:

- transaction → details;
- quick entry → parsed preview;
- filter → filtered state;
- compact card → expanded state.

## Feedback

The changed object is the first source of feedback. Toasts are secondary and should not duplicate visible state changes.

## Accessibility

Every motion pattern must work with `prefers-reduced-motion`. Reduced motion removes decorative movement while preserving state clarity.

## Performance

Prefer `transform` and `opacity`. Do not use `transition: all`. Avoid perpetual pulse, mount-time animation spam, and stagger on frequently visited lists.

## Product vs landing

The landing can use reveal and narrative motion. The authenticated product prioritizes speed, clarity, and predictability.
