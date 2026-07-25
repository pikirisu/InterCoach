import { apiClient } from "../../api/client";
import type { ApiSuccess } from "../../types/api";
import type { AuthSession } from "../../types/auth";
import { clearAuthSession, getRefreshToken, saveAuthSession } from "./auth.storage";
import type { LoginFormValues, RegisterFormValues } from "./auth.schemas";

interface LogoutResponse {
  userId: string;
}

export class AuthService {
  static async login(payload: LoginFormValues) {
    const response = await apiClient.post<ApiSuccess<AuthSession>>("/auth/login", payload);

    saveAuthSession(response.data.data);

    return response.data;
  }

  static async register(payload: RegisterFormValues) {
    const response = await apiClient.post<ApiSuccess<AuthSession>>("/auth/register", payload);

    saveAuthSession(response.data.data);

    return response.data;
  }

  static async refreshToken() {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      return null;
    }

    const response = await apiClient.post<ApiSuccess<AuthSession>>("/auth/refresh-token", {
      refreshToken,
    });

    saveAuthSession(response.data.data);

    return response.data;
  }

  static async logout() {
    try {
      await apiClient.post<ApiSuccess<LogoutResponse>>("/auth/logout");
    } finally {
      clearAuthSession();
    }
  }

  static logoutLocal() {
    clearAuthSession();
  }
}
