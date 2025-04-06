export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  }

  export interface LoginDto {
    email: string;
    password: string;
  }

  export interface RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }

  export interface AuthResponse {
    message: string;
  }