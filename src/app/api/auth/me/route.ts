import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import type { UserRole } from '@/types/user';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Normalize whatever the DB returns and widen the type
    const role = String(user.role).toUpperCase() as UserRole;
    const isAdmin = role === 'ADMIN' || role === 'MASTER';

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
