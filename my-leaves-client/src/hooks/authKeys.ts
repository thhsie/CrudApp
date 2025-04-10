/* =============================================
   3. src/hooks/authKeys.ts
   ============================================= */
export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'currentUser'] as const, // For GET /users/me
  roles: (email?: string) => [...authKeys.all, 'roles', email ?? 'all'] as const, // For GET /users/roles
  // Key for admin users *infinite* query
  adminUsers: (pageSize: number) => [...authKeys.all, 'users', 'admin', 'all', { pageSize }] as const,
};