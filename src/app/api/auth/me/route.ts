import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Mock user data based on JWT token
    const mockUserData = {
      id: user.userId,
      email: user.email,
      role: user.role,
      name: user.role === 'MASTER' ? 'Master User' : 
            user.role === 'ADMIN' ? 'Admin User' : 'Regular User',
      isActive: true,
      organizationId: user.organizationId,
      centrePermissions: user.role === 'MASTER' ? [] : [
        {
          centreId: 'centre_1',
          centreName: 'Papamoa Beach',
          centreCode: 'CC1',
          permissions: {
            canViewOccupancy: true,
            canEditOccupancy: user.role === 'ADMIN' || user.role === 'MASTER',
            canViewFinancials: user.role === 'ADMIN' || user.role === 'MASTER',
            canEditFinancials: user.role === 'MASTER',
            canViewEnrollments: true,
            canEditEnrollments: user.role === 'ADMIN' || user.role === 'MASTER',
            canViewReports: true,
            canManageStaff: user.role === 'MASTER',
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
