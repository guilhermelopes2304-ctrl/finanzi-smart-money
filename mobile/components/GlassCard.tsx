import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { PropsWithChildren } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';

export function GlassCard({ children, style, interactive = false }: PropsWithChildren<{ style?: ViewStyle; interactive?: boolean }>) {
  const canUseGlass = Platform.OS === 'ios' && isGlassEffectAPIAvailable();
  if (!canUseGlass) return <View style={[styles.fallback, style]}>{children}</View>;
  return (
    <GlassView style={[styles.glass, style]} glassEffectStyle="regular" isInteractive={interactive}>
      {children}
    </GlassView>
  );
}

const styles = StyleSheet.create({
  glass: { borderRadius: 28, overflow: 'hidden' },
  fallback: { borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
});
