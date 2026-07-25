import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { clearAuthSession, getAccessToken, getRefreshToken, saveAuthSession } from "../features/auth/auth.storage";
import type { ApiSuccess } from "../types/api";
import type { AuthSession } from "../types/auth";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1";
const refreshTokenPath = "/auth/refresh-token";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshSessionRequest: Promise<AuthSession> | null = null;

const isAuthEndpoint = (url?: string) => {
  if (!url) {
    return true;
  }

  return url.includes("/auth/login") || url.includes("/auth/register") || url.includes(refreshTokenPath);
};

const requestTokenRefresh = () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return Promise.reject(new Error("Refresh token is missing."));
  }

  refreshSessionRequest ??= refreshClient
    .post<ApiSuccess<AuthSession>>(refreshTokenPath, { refreshToken })
    .then((response) => {
      const session = response.data.data;
      saveAuthSession(session);

      return session;
    })
    .finally(() => {
      refreshSessionRequest = null;
    });

  return refreshSessionRequest;
};

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const session = await requestTokenRefresh();
      originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      clearAuthSession();

      return Promise.reject(refreshError);
    }
  },
);
