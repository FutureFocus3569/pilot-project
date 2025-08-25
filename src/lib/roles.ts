export const ROLES = ['USER', 'ADMIN', 'MASTER'] as const;
export type UserRole = typeof ROLES[number];

export function toUserRole(value: unknown): UserRole {
  const v = String(value ?? '').toUpperCase();
  return (ROLES as readonly string[]).includes(v) ? (v as UserRole) : 'USER';
}

export function isAdminRole(value: unknown): boolean {
  const role = toUserRole(value);
  return role === 'ADMIN' || role === 'MASTER';
}

export function isMasterRole(value: unknown): boolean {
  return toUserRole(value) === 'MASTER';
}
