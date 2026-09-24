export interface User {
  id: number;
  name: string;
  email: string;
}

/** Response of `POST /auth/login` and `POST /auth/signup`. */
export interface AuthResponse {
  token: string;
  /** Token lifetime in seconds. */
  expires_in: number;
  user: User;
}

export interface Session {
  token: string;
  /** Epoch milliseconds. */
  expiresAt: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  password_confirmation: string;
}

export interface MessageResponse {
  message: string;
}
