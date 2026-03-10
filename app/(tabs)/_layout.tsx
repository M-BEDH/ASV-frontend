import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../styles/colors';
import { View, Text } from 'react-native';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 4 }}>
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
      <Text style={{ fontSize: 10, color: focused ? Colors.primary : Colors.textMuted, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
 const { user, loading, isClient } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: 64,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📅" label="Agenda" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="animaux"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🐾" label="Animaux" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="proprietaires"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label={isClient ? 'Profil' : 'Propriétaires'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="consultations"
        options={{
          // Les clients ne voient pas l'onglet Consultations
          href: isClient ? null : undefined,
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="Consultations" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
