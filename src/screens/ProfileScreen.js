import { useEffect, useState } from 'react';
import { View, Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../services/userService';
import { colors, fonts } from '../theme';

function fullName(user) {
  return [user.name, user.middleName, user.firstLastName, user.secondLastName]
    .filter(Boolean)
    .join(' ');
}

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    getMe().then(setUser);
  }, []);

  return (
    <View style={s.container}>
      {user ? (
        <Text style={s.name}>{fullName(user)}</Text>
      ) : (
        <ActivityIndicator color={colors.brandSecondary} />
      )}
      <Pressable style={s.logoutBtn} onPress={logout}>
        <Text style={s.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'flex-end',
    gap: 16,
  },
  name: {
    fontFamily: fonts.semibold,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  logoutBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: colors.redBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.redBorder,
    alignItems: 'center',
  },
  logoutText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.redText,
  },
});
