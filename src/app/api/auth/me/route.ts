import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { isAdminRole, isMasterRole } from '@/lib/roles';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

  const isAdmin = isAdminRole(user.role);

    const mockUserData = {
      id: user.userId,
      email: user.email,
      role: user.role,
      name: isMasterRole(user.role) ? 'Master User' : 
            isAdminRole(user.role) ? 'Admin User' : 'Regular User',
      isActive: true,
      organizationId: user.organizationId,
      centrePermissions: isMasterRole(user.role) ? [] : [
        {
          centreId: 'centre_1',
          centreName: 'Papamoa Beach',
          centreCode: 'CC1',
          permissions: {
            canViewOccupancy: true,
            canEditOccupancy: isAdmin,
            canViewFinancials: isAdmin,
            canEditFinancials: isMasterRole(user.role),
            canViewEnrollments: true,
            canEditEnrollments: isAdmin,
            canViewReports: true,
            canManageStaff: isMasterRole(user.role),
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
