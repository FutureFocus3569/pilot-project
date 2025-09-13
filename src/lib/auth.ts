import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export interface AuthUser {
  userId: string;
  email: string;
  role: 'MASTER' | 'ADMIN' | 'USER';
  centreId: string;
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
  centreId: decoded.centreId,
    };
  } catch (error) {
    return null;
  }
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  
  return verifyToken(token);
}

export function requireAuth(request: NextRequest): AuthUser | NextResponse {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return user;
}

export function requireRole(request: NextRequest, allowedRoles: string[]): AuthUser | NextResponse {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }
  
  return user;
}
