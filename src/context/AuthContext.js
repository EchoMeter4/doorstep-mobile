import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet(['auth_token', 'auth_user'])
      .then(([[, token], [, storedUser]]) => {
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      })
      .finally(() => setInitializing(false));
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { user, token } = await authService.login(email, password);
      await AsyncStorage.multiSet([
        ['auth_token', token],
        ['auth_user', JSON.stringify(user)],
      ]);
      setUser(user);
    } catch (e) {
      // setError(e.response?.data?.message ?? 'Error al iniciar sesión');
      setError(JSON.stringify(e))
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (_) {}
    await AsyncStorage.multiRemove(['auth_token', 'auth_user']);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error, initializing }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
