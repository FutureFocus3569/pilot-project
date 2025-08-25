import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import type { UserRole } from '@/types/user';
import { toUserRole, isAdminRole } from '@/lib/roles';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

  // Normalize and widen the type
  const role: UserRole = toUserRole(user.role);
  const isAdmin = isAdminRole(role);

    const mockUserData = {
      id: user.userId,
      email: user.email,
      role,
      name: role === 'MASTER' ? 'Master User' : 
            role === 'ADMIN' ? 'Admin User' : 'Regular User',
      isActive: true,
      organizationId: user.organizationId,
      centrePermissions: role === 'MASTER' ? [] : [
        {
          centreId: 'centre_1',
          centreName: 'Papamoa Beach',
          centreCode: 'CC1',
          permissions: {
            canViewOccupancy: true,
            canEditOccupancy: isAdmin,
            canViewFinancials: isAdmin,
            canEditFinancials: role === 'MASTER',
            canViewEnrollments: true,
            canEditEnrollments: isAdmin,
            canViewReports: true,
            canManageStaff: role === 'MASTER',
          }
        }
      ]
    };

    return NextResponse.json({ user: mockUserData });

  } catch (error) {
    console.error('Error getting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
