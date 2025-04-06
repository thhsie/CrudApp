export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'currentUser'] as const, // For GET /users/me
  roles: (email?: string) => [...authKeys.all, 'roles', email ?? 'all'] as const, // For GET /users/roles
};