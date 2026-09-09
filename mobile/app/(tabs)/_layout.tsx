import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#F97316', tabBarInactiveTintColor: '#8E8E93', tabBarStyle: { position: 'absolute', backgroundColor: 'transparent', borderTopWidth: 0, elevation: 0 }, tabBarLabelStyle: { fontSize: 11, fontWeight: '600' } }}>
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({ color, size }) => <Ionicons name="sparkles" color={color} size={size} /> }} />
      <Tabs.Screen name="lancamentos" options={{ title: 'Lançamentos', tabBarIcon: ({ color, size }) => <Ionicons name="list" color={color} size={size} /> }} />
      <Tabs.Screen name="inteligencia" options={{ title: 'Inteligência', tabBarIcon: ({ color, size }) => <Ionicons name="bulb" color={color} size={size} /> }} />
    </Tabs>
  );
}
