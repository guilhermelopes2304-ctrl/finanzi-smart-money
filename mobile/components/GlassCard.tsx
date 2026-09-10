import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { PropsWithChildren } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';

export function GlassCard({
  children,
  style,
  interactive = false,
  tintColor,
}: PropsWithChildren<{ style?: ViewStyle; interactive?: boolean; tintColor?: string }>) {
  const canUseGlass = Platform.OS === 'ios' && isGlassEffectAPIAvailable();
  if (!canUseGlass) return <View style={[styles.fallback, style]}>{children}</View>;
  return (
    <GlassView style={[styles.glass, style]} glassEffectStyle="regular" isInteractive={interactive} tintColor={tintColor}>
      {children}
    </GlassView>
  );
}

const styles = StyleSheet.create({
  glass: { overflow: 'hidden' },
  fallback: { overflow: 'hidden', backgroundColor: 'rgba(118,118,128,0.12)' },
});
