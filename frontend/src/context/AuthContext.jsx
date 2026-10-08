import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, setAccessToken, setAuthLostHandler } from '../services/api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const startSession = useCallback(({ data }) => { setAccessToken(data.accessToken); setUser(data.user); return data.user; }, []);

  useEffect(() => {
    setAuthLostHandler(() => setUser(null));
    // Persistence across refreshes: exchange the httpOnly refresh cookie for a fresh access token.
    authApi.refresh().then(startSession).catch(() => setUser(null)).finally(() => setLoading(false));
  }, [startSession]);

  const login = async (d) => startSession(await authApi.login(d));
  const register = async (d) => startSession(await authApi.register(d));
  const logout = async () => { try { await authApi.logout(); } finally { setAccessToken(null); setUser(null); } };

  return <AuthContext.Provider value={{ user, loading, setUser, startSession, login, register, logout }}>{children}</AuthContext.Provider>;
}
