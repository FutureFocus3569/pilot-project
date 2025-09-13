"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'MASTER' | 'ADMIN' | 'USER';
  isActive: boolean;
  organizationId: string;
  xeroCentres?: string[];
  centrePermissions?: {
    centreId: string;
    centreName: string;
    centreCode: string;
    permissions: {
      canViewOccupancy: boolean;
      canEditOccupancy: boolean;
      canViewFinancials: boolean;
      canEditFinancials: boolean;
      canViewEnrollments: boolean;
      canEditEnrollments: boolean;
      canViewReports: boolean;
      canManageStaff: boolean;
    };
  }[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
  switchRole: (role: 'MASTER' | 'ADMIN' | 'USER') => void; // For demo purposes
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Update user role from localStorage if available
  useEffect(() => {
    if (user) {
      const storedRole = localStorage.getItem('currentUserRole') as 'MASTER' | 'ADMIN' | 'USER' | null;
      if (storedRole && storedRole !== user.role) {
        setUser({ ...user, role: storedRole });
      }
    }
  }, [user?.id]); // Only run when user ID changes

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Force MASTER role for Courtney
        const userData = data.user;
        if (userData.email === 'courtney@futurefocus.co.nz') {
          userData.role = 'MASTER';
        }
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  // Demo function to switch roles for testing
  const switchRole = (role: 'MASTER' | 'ADMIN' | 'USER') => {
    console.log('switchRole called with:', role);
    console.log('Current user:', user);
    if (user) {
      const updatedUser = { ...user, role };
      console.log('Setting new user:', updatedUser);
      setUser(updatedUser);
      // Force a re-render by updating localStorage or session storage
      localStorage.setItem('currentUserRole', role);
    } else {
      console.log('No user found, cannot switch role');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
