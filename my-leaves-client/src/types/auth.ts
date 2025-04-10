/* =============================================
   1. src/types/auth.ts
   ============================================= */

/** Basic user information derived from the authentication context */
export interface User {
    id: string;
    email: string;
    isAdmin: boolean;
    leaveBalances?: LeaveBalances;
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
    username: string;
    providerKey: string;
    email?: string | null;
}

/** DTO for the API's token response */
export interface AccessTokenResponse {
    tokenType: string;
    accessToken: string;
    expiresIn: number;
    refreshToken: string;
}

// --- Updated/New TYPES ---

/** Structure of leave balances (matches backend LeaveBalancesDto) */
export interface LeaveBalances {
    annualLeavesBalance: number;
    sickLeavesBalance: number;
    specialLeavesBalance: number;
}

/** DTO for updating leave balances via API (matches backend LeaveBalancesUpdateRequest) */
export interface LeaveBalancesUpdateDto {
    paidLeavesBalance: number; // Matches backend property name
    sickLeavesBalance: number;
    specialLeavesBalance: number;
}

/** DTO representing a user in the admin list (matches backend UserListItemDto) */
export interface UserListItem {
    id: string;
    email: string | null;
    userName: string | null;
    leaveBalances: LeaveBalances | null; // Use the LeaveBalances interface
}

/** Structure for the paginated user response (matches backend PaginatedResponse<UserListItemDto>) */
export interface PaginatedUserResponse {
    data: UserListItem[];
    totalCount: number;
    // Backend might send these, even if 0 for users. Match the backend structure.
    pendingCount: number; // Or remove if backend doesn't send for users
    approvedCount: number;// Or remove if backend doesn't send for users
    rejectedCount: number;// Or remove if backend doesn't send for users
    pageNumber: number;
    pageSize: number;
}