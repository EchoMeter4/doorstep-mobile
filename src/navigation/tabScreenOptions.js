import { StyleSheet, Pressable } from 'react-native';
import { Cog6ToothIcon } from 'react-native-heroicons/solid';
import HeaderLogo from '../components/HeaderLogo';
import { colors, fonts } from '../theme';

const tabScreenOptions = (navigation) => ({
  headerShown: true,
  headerStyle: { backgroundColor: colors.brandPrimary },
  headerTintColor: '#FFFFFF',
  headerTitle: () => null,
  headerLeft: () => <HeaderLogo />,
  headerRight: () => (
    <Pressable onPress={() => navigation.navigate('Profile')} style={{ marginRight: 16 }}>
      <Cog6ToothIcon size={22} color="#FFFFFF" />
    </Pressable>
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
});

export default tabScreenOptions;
