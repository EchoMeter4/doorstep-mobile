import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import MainTabs from '../screens/MainTabs';
import ProfileScreen from '../screens/ProfileScreen';
import { colors, fonts } from '../theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { initializing, user } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accentBlue} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              headerShown: true,
              title: 'Mi perfil',
              headerStyle: { backgroundColor: colors.brandPrimary },
              headerTintColor: '#FFFFFF',
              headerTitleStyle: { fontFamily: fonts.semibold, fontSize: 17 },
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
