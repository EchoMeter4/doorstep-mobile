import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeIcon, ShieldCheckIcon } from 'react-native-heroicons/solid';
import HomeScreen from './HomeScreen';
import AccessControlScreen from './AccessControlScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.separator,
        },
        tabBarActiveTintColor: colors.accentBlue,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <HomeIcon size={24} color={color} />,
          title: 'Inicio',
        }}
      />
      <Tab.Screen
        name="Control"
        component={AccessControlScreen}
        options={{
          tabBarIcon: ({ color }) => <ShieldCheckIcon size={24} color={color} />,
          title: 'Control de Acceso',
        }}
      />
    </Tab.Navigator>
  );
}
