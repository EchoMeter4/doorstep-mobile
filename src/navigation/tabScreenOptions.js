import { StyleSheet } from 'react-native';
import HeaderLogo from '../components/HeaderLogo';
import { colors, fonts } from '../theme';

const tabScreenOptions = {
  headerShown: true,
  headerStyle: { backgroundColor: colors.brandPrimary },
  headerTintColor: '#FFFFFF',
  headerTitle: () => null,
  headerLeft: () => <HeaderLogo />,
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
};

export default tabScreenOptions;
