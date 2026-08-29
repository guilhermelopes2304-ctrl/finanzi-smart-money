# FINANZZI mobile release checklist

## PWA
- Confirm HTTPS and the production manifest.
- Confirm install flow on Android Chromium.
- Confirm Add to Home Screen guidance on iOS.
- Confirm the app opens in standalone mode.
- Confirm offline fallback is reachable with the network disabled.
- Confirm a waiting service worker only updates after user confirmation.

## Native shell
- Run `bun run cap:sync` after every production web build.
- Validate safe areas, keyboard resize, status bar and deep links on physical devices.
- Keep web and native authentication flows covered by release testing.

## Store release
Native project generation and store submission remain separate release steps after this foundation is merged and validated.
