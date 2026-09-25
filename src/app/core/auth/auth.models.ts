export interface User {
  id: number;
  name: string;
  email: string;
}

/** `data` of `POST /auth/login` and `POST /auth/register` (after the envelope is unwrapped). */
export interface AuthResponse {
  token: string;
  token_type?: string;
  /** Token lifetime in seconds. */
  expires_in: number;
  expires_at?: string;
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

/** The reset link is `FRONTEND_URL/reset-password/{token}?email=...`. */
export interface ResetPasswordRequest {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}
