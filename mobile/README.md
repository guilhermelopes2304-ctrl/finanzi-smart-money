# FINANZZI iOS — Liquid Glass

Native iOS redesign using Expo Router and `expo-glass-effect`, following the iOS 26 Liquid Glass interaction model.

## Run

```bash
cd mobile
npm install
npx expo start
```

For native iOS Liquid Glass, use a development build compiled with Xcode 26 / iOS 26.

## Direction

- iOS 26 native Liquid Glass surfaces instead of CSS blur simulation.
- Large-title hierarchy and compact financial summaries.
- Floating primary quick-entry action.
- Native-feeling tab navigation.
- FINANZZI orange retained as the product accent.
- Existing web/Supabase application remains untouched while the native mobile layer is migrated incrementally.

`GlassView` is guarded with runtime availability checks and falls back to a regular surface when Liquid Glass is unavailable.
