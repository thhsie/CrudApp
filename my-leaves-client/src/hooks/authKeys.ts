export interface AdminUsersFilter {
    pageSize?: number;
    searchTerm?: string | null; // Filter by search term (e.g., email or name)
}

export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'currentUser'] as const, // For GET /users/me
  roles: (email?: string) => [...authKeys.all, 'roles', email ?? 'all'] as const, // For GET /users/roles
  // Key for admin users *infinite* query - accepts filter object
  adminUsers: (filter: AdminUsersFilter) => [...authKeys.all, 'users', 'admin', 'all', { ...filter }] as const,
}