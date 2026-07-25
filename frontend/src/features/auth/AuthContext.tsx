import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import type { ApiSuccess } from "../../types/api";
import type { AuthSession, AuthUser } from "../../types/auth";
import { AuthService } from "./AuthService";
import type { LoginFormValues, RegisterFormValues } from "./auth.schemas";
import { AUTH_SESSION_CHANGED_EVENT, getStoredAuthSession } from "./auth.storage";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (values: LoginFormValues) => Promise<ApiSuccess<AuthSession>>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<ApiSuccess<AuthSession> | null>;
  register: (values: RegisterFormValues) => Promise<ApiSuccess<AuthSession>>;
  user: AuthUser | null;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredAuthSession()?.user ?? null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const syncSession = () => {
      setUser(getStoredAuthSession()?.user ?? null);
    };

    const handleSessionChange = () => syncSession();

    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleSessionChange);
    window.addEventListener("storage", syncSession);

    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleSessionChange);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  const login = useCallback(async (values: LoginFormValues) => {
    const response = await AuthService.login(values);
    setUser(response.data.user);

    return response;
  }, []);

  const register = useCallback(async (values: RegisterFormValues) => {
    const response = await AuthService.register(values);
    setUser(response.data.user);

    return response;
  }, []);

  const refreshSession = useCallback(async () => {
    const response = await AuthService.refreshToken();

    if (!response) {
      setUser(null);
      return null;
    }

    setUser(response.data.user);

    return response;
  }, []);

  const logout = useCallback(async () => {
    await AuthService.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      refreshSession,
      register,
      user,
    }),
    [isLoading, login, logout, refreshSession, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
