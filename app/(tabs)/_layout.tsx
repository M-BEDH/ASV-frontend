import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

function TabIcon({
  name,
  label,
  size,
  focused,
  isMobile,
  colors,
}: {
  name: IconName;
  label: string;
  size: number;
  focused: boolean;
  isMobile: boolean;
  colors: any;
}) {
  const color = focused ? colors.primary : colors.textMuted;
  return (
    <View style={{ alignItems: 'center', paddingVertical: isMobile ? 0 : 5 }} accessibilityLabel={label} accessibilityRole="tab">
      <MaterialCommunityIcons name={name} size={size} color={color} accessibilityElementsHidden />
      {!isMobile && <Text style={{ fontSize: 10, color, marginTop: 2 }}>{label}</Text>}
    </View>
  );
}

export default function TabsLayout() {
  const { user, loading, isClient } = useAuth();
  const { colors } = useTheme();
  const { isMobile } = useBreakpoint();

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          shadowOpacity: 0,
          elevation: 0,
          height: isMobile ? 60 : 70,
        },
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.surface }]} />
        ),
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" label="Home" size={isMobile ? 24 : 26} focused={focused} isMobile={isMobile} colors={colors} />
          ),
        }}
      />
       <Tabs.Screen
        name="consultations"
        options={{
          href: isClient ? null : undefined,
          tabBarIcon: ({ focused }) => (
            <TabIcon name="view-dashboard-outline" label="Consultations" size={isMobile ? 22 : 24} focused={focused} isMobile={isMobile} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="animaux"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="paw" label="Animaux" size={isMobile ? 22 : 24} focused={focused} isMobile={isMobile} colors={colors} />
          ),
        }}
      />
      <Tabs.Screen
        name="proprietaires"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={isClient ? 'account-outline' : 'account-multiple-outline'}
              label={isClient ? 'Profil' : 'Propriétaires'}
              size={isMobile ? 24 : 26}
              focused={focused}
              isMobile={isMobile}
              colors={colors}
            />
          ),
        }}
      />
       <Tabs.Screen
        name="mentionLegales"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="file-document-outline" label="Mentions Légales" size={isMobile ? 20 : 22} focused={focused} isMobile={isMobile} colors={colors} />
          ),
        }}
      />
    </Tabs>
  );
}
