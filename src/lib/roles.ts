import { ROLES, type UserRole } from '@/types/user';

export function toUserRole(value: unknown): UserRole {
  const v = String(value ?? '').toUpperCase();
  return (ROLES as readonly string[]).includes(v) ? (v as UserRole) : 'USER';
}

export function isAdminRole(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'MASTER';
}
