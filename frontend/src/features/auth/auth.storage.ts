import type { AuthSession, AuthUser } from "../../types/auth";

export const AUTH_SESSION_CHANGED_EVENT = "intercoach:auth-session-changed";

const ACCESS_TOKEN_KEY = "intercoach.accessToken";
const REFRESH_TOKEN_KEY = "intercoach.refreshToken";
const USER_KEY = "intercoach.user";

const canUseStorage = () => {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isAuthUser = (value: unknown): value is AuthUser => {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value._id === "string" && typeof value.name === "string" && typeof value.email === "string";
};

const notifySessionChanged = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
  }
};

export const getAccessToken = () => {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = () => {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const getStoredUser = () => {
  if (!canUseStorage()) {
    return null;
  }

  const storedUser = window.localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    const parsedUser: unknown = JSON.parse(storedUser);

    return isAuthUser(parsedUser) ? parsedUser : null;
  } catch {
    return null;
  }
};

export const getStoredAuthSession = (): AuthSession | null => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const user = getStoredUser();

  if (!accessToken || !refreshToken || !user) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    user,
  };
};

export const saveAuthSession = (session: AuthSession) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  notifySessionChanged();
};

export const clearAuthSession = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  notifySessionChanged();
};
