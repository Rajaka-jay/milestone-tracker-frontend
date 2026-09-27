import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api';
import { onUnauthorized, tokenStore } from '../services/http';
import { API_URL, USE_MOCK } from '../config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.get()));

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  // Restore the session on first load.
  useEffect(() => {
    onUnauthorized(logout);
    if (!tokenStore.get()) return undefined;
    let cancelled = false;
    authApi.me()
      .then((me) => { if (!cancelled) setUser(me); })
      .catch(() => { if (!cancelled) tokenStore.clear(); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [logout]);

  const startSession = useCallback(({ token, user: me }) => {
    tokenStore.set(token);
    setUser(me);
    return me;
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login: async (email, password) => startSession(await authApi.login(email.trim(), password)),
    register: async (payload) => startSession(await authApi.register({ ...payload, email: payload.email.trim() })),
    loginWithGoogle: async () => {
      if (USE_MOCK) return startSession(await authApi.google());
      // Real backend: hand off to the OAuth flow, which returns to /auth/callback?token=...
      window.location.href = `${API_URL}/auth/google`;
      return null;
    },
    completeLogin: async (token) => {
      tokenStore.set(token);
      const me = await authApi.me();
      setUser(me);
      return me;
    },
    updateUser: (next) => setUser((prev) => ({ ...prev, ...next })),
    logout,
  }), [user, loading, logout, startSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
