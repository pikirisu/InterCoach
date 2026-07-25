export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}
