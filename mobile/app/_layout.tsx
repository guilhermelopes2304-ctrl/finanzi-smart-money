import { Stack, Redirect, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { AuthProvider, useNativeAuth } from '@/providers/AuthProvider';

function Navigation() {
  const scheme = useColorScheme();
  const { session, loading } = useNativeAuth();
  const segments = useSegments();
  const inAuth = segments[0] === 'auth';

  if (!loading && !session && !inAuth) return <Redirect href="/auth" />;
  if (!loading && session && inAuth) return <Redirect href="/(tabs)" />;

  return (
    <>
      <StatusBar style={scheme === 'light' ? 'dark' : 'light'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: scheme === 'light' ? '#F5F5F7' : '#09090B' } }} />
    </>
  );
}

export default function RootLayout() {
  return <AuthProvider><Navigation /></AuthProvider>;
}
