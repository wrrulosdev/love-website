import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import * as authApi from '../services/auth';

type User = {
  id?: number;
  username?: string;
  email?: string;
  [k: string]: unknown;
};

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  ready: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: (allSessions?: boolean) => Promise<void>;
  getAccessToken: () => string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Localstorage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'auth_user';

/* 
  AuthProvider
*/
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem(ACCESS_TOKEN_KEY)
  );

  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reqId = api.interceptors.request.use((cfg) => {
      const token = accessToken ?? localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) cfg.headers = { ...(cfg.headers ?? {}), Authorization: `Bearer ${token}` };
      return cfg;
    });

    const resId = api.interceptors.response.use(
      (r) => r,
      async (err) => {
        const original = err.config;
        if (!original) return Promise.reject(err);

        if (err.response?.status === 401 && !original._retry) {
          original._retry = true;
          try {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
            if (!refreshToken) throw new Error('no refresh token');

            const tokens = await authApi.refreshApi(refreshToken);
            if (tokens?.access_token) {
              localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
              if (tokens.refresh_token)
                localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);

              setAccessToken(tokens.access_token);

              original.headers = {
                ...(original.headers ?? {}),
                Authorization: `Bearer ${tokens.access_token}`,
              };
              return api(original);
            }
          } catch {
            await doLocalLogout();
            return Promise.reject(err);
          }
        }

        return Promise.reject(err);
      }
    );

    return () => {
      api.interceptors.request.eject(reqId);
      api.interceptors.response.eject(resId);
    };
  }, [accessToken]);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (token) {
        setAccessToken(token);
        try {
          const me = await authApi.meApi();
          setUser(me);
          localStorage.setItem(USER_KEY, JSON.stringify(me));
        } catch {
          if (refresh) {
            try {
              const tokens = await authApi.refreshApi(refresh);
              if (tokens?.access_token) {
                localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
                if (tokens.refresh_token)
                  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);

                setAccessToken(tokens.access_token);

                const me = await authApi.meApi();
                setUser(me);
                localStorage.setItem(USER_KEY, JSON.stringify(me));
              }
            } catch {
              await doLocalLogout();
            }
          } else {
            await doLocalLogout();
          }
        }
      } else if (refresh) {
        try {
          const tokens = await authApi.refreshApi(refresh);
          if (tokens?.access_token) {
            localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
            if (tokens.refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);

            setAccessToken(tokens.access_token);

            const me = await authApi.meApi();
            setUser(me);
            localStorage.setItem(USER_KEY, JSON.stringify(me));
          }
        } catch {
          await doLocalLogout();
        }
      }

      setReady(true);
    })();
  }, []);

  /* 
    Clears tokens and user info from localStorage and memory.
  */
  async function doLocalLogout() {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /* 
    Calls the login API with username and password.
  */
  async function login(username: string, password: string) {
    const data = await authApi.loginApi(username, password);
    if (!data?.access_token) throw new Error('login failed: no access token');

    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
    if (data.refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);

    setAccessToken(data.access_token);

    try {
      const me = await authApi.meApi();
      setUser(me);
      localStorage.setItem(USER_KEY, JSON.stringify(me));
    } catch {
      setUser(null);
    }
  }

  /* 
    Calls the backend to log out and clears local state.
  */
  async function logout(allSessions = false) {
    try {
      await authApi.logoutApi(allSessions);
    } catch {
      /* empty */
    }
    await doLocalLogout();
  }

  /* Returns current access token from memory or localStorage */
  function getAccessToken() {
    return accessToken ?? localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  const value: AuthContextType = {
    user,
    accessToken: getAccessToken(),
    isAuthenticated: !!getAccessToken() && !!user,
    ready,
    login,
    logout,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
