import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { loginTenant } from '../api/auth';

const STORAGE_KEY = 'mob-rental-session';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed?.expiresIn && Number(parsed.expiresIn) > Date.now()) {
          setSession(parsed);
        } else {
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const nextSession = await loginTenant(email, password);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
    return nextSession;
  }, []);

  useEffect(() => {
    if (!session?.expiresIn) return undefined;
    const ms = Number(session.expiresIn) - Date.now();
    if (ms <= 0) {
      logout();
      return undefined;
    }
    const timer = setTimeout(logout, ms);
    return () => clearTimeout(timer);
  }, [logout, session?.expiresIn]);

  const value = useMemo(
    () => ({
      session,
      token: session?.token || null,
      userId: session?.userId || null,
      role: session?.role || null,
      appType: session?.appType || null,
      isAuthenticated: Boolean(session?.token && session?.userId),
      booting,
      login,
      logout
    }),
    [booting, login, logout, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
