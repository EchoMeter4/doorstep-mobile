import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors, fonts } from '../theme';
import LogoMark from '../components/LogoMark';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogin = () => {
    login(email, password);
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.card}>
          <View style={s.brand}>
            <LogoMark size={72} radius={20} />
            <Text style={s.wordmark}>Doorstep</Text>
            <Text style={s.tagline}>Control de Acceso</Text>
          </View>

          <Text style={s.heading}>Iniciar Sesión</Text>

          <View style={s.fieldWrap}>
            <Text style={s.label}>Correo electrónico</Text>
            <TextInput
              style={s.input}
              placeholder="tu@correo.com"
              placeholderTextColor={colors.gray400}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={s.fieldWrap}>
            <Text style={s.label}>Contraseña</Text>
            <TextInput
              style={s.input}
              placeholder="••••••••"
              placeholderTextColor={colors.gray400}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error ? <Text style={s.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[s.button, loading && s.buttonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.buttonText}>Iniciar Sesión</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 28,
    paddingVertical: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 5,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 24,
  },
  wordmark: {
    fontSize: 26,
    fontFamily: fonts.bold,
    color: colors.brandPrimary,
    letterSpacing: -0.5,
    marginTop: 12,
  },
  tagline: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  heading: {
    fontSize: 26,
    fontFamily: fonts.semibold,
    color: colors.textPrimary,
    marginBottom: 24,
  },
  fieldWrap: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  error: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.redText,
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.brandSecondary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: fonts.semibold,
    letterSpacing: 0.2,
  },
});
