import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeIcon, ShieldCheckIcon } from 'react-native-heroicons/solid';
import HomeScreen from './HomeScreen';
import AccessControlScreen from './AccessControlScreen';
import tabScreenOptions from '../navigation/tabScreenOptions';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
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
