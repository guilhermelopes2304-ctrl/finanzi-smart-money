import { GlassContainer, GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { PropsWithChildren } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';

export function GlassFilterGroup({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  const available = Platform.OS === 'ios' && isGlassEffectAPIAvailable();
  if (!available) return <View style={[styles.fallback, style]}>{children}</View>;
  return <GlassContainer spacing={8} style={[styles.container, style]}>{children}</GlassContainer>;
}

export function GlassFilter({ active, children, onPress }: PropsWithChildren<{ active: boolean; onPress: () => void }>) {
  const available = Platform.OS === 'ios' && isGlassEffectAPIAvailable();
  if (!available) return <View style={[styles.filter, active && styles.activeFallback]}>{children}</View>;
  return <GlassView style={[styles.filter, active && styles.active]} glassEffectStyle="regular" isInteractive onTouchEnd={onPress}>{children}</GlassView>;
}

const styles = StyleSheet.create({ container: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' }, fallback: { flexDirection: 'row', gap: 8 }, filter: { height: 34, minWidth: 66, borderRadius: 17, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center' }, active: { backgroundColor: 'rgba(217,95,24,0.18)' }, activeFallback: { backgroundColor: 'rgba(217,95,24,0.18)' } });
