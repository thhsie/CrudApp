// --- Updated File: ./my-leaves-client/src/types/auth.ts ---

/** Basic user information derived from the authentication context */
export interface User {
    id: string; // User's unique identifier (GUID from backend, or email as fallback)
    email: string; // User's email
    isAdmin: boolean;
    //roles: string[]; // Roles like "Admin", "Standard"
  }

/** Data required for standard login via BFF */
export interface LoginDto {
    email: string;
    password: string;
  }

/** Data required for standard registration via BFF/API */
export interface RegisterDto {
    email: string;
    password: string;
  }

/** Generic response structure for auth operations (primarily for errors) */
export interface AuthResponse {
    message?: string;
    errors?: Record<string, string[]>;
  }

/** Information sent to the API for external login token exchange */
export interface ExternalUserInfo {
    username: string; // Usually email or name from provider
    providerKey: string; // The protected user ID from the provider
    email?: string | null; // Optional email
}

/** DTO for the API's token response */
export interface AccessTokenResponse {
    tokenType: string;
    accessToken: string;
    expiresIn: number;
    refreshToken: string;
}