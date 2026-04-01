import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeIcon, ShieldCheckIcon } from 'react-native-heroicons/solid';
import HomeScreen from './HomeScreen';
import AccessControlScreen from './AccessControlScreen';
import { colors, fonts } from '../theme';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.brandPrimary },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontFamily: fonts.semibold, fontSize: 17 },
        headerLeft: () => (
          <View style={{ marginLeft: 16 }}>
            <ShieldCheckIcon size={22} color="#FFFFFF" />
          </View>
        ),
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: colors.brandSecondary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarLabelStyle: {
          fontFamily: fonts.medium,
          fontSize: 11,
        },
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <HomeIcon size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Control"
        component={AccessControlScreen}
        options={{
          tabBarIcon: ({ color }) => <ShieldCheckIcon size={22} color={color} />,
          title: 'Control',
        }}
      />
    </Tab.Navigator>
  );
}
