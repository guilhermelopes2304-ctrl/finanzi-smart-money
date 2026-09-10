import { GlassContainer, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { PropsWithChildren } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';

export function GlassFilterGroup({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  const available = Platform.OS === 'ios' && isGlassEffectAPIAvailable();
  if (!available) return <View style={[styles.fallback, style]}>{children}</View>;
  return <GlassContainer spacing={8} style={[styles.container, style]}>{children}</GlassContainer>;
}

const styles = StyleSheet.create({ container: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' }, fallback: { flexDirection: 'row', gap: 8 } });
