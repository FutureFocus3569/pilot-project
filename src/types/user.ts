export const ROLES = ['USER', 'ADMIN', 'MASTER'] as const;
export type UserRole = typeof ROLES[number];
