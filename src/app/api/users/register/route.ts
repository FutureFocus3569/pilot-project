import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, organizationId, centreIds } = await req.json();

    // Validate required fields
    if (!name || !email || !password || !organizationId) {
      return NextResponse.json(
        { error: 'Name, email, password, and organization are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'USER',
        organizationId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    // If centre IDs provided, create permissions
    if (centreIds && centreIds.length > 0) {
      await prisma.userCentrePermission.createMany({
        data: centreIds.map((centreId: string) => ({
          userId: user.id,
          centreId,
          // Default permissions based on role
          canViewOccupancy: true,
          canEditOccupancy: role === 'ADMIN' || role === 'MASTER',
          canViewFinancials: role === 'ADMIN' || role === 'MASTER',
          canEditFinancials: role === 'MASTER',
          canViewEnrollments: true,
          canEditEnrollments: role === 'ADMIN' || role === 'MASTER',
          canViewReports: true,
          canManageStaff: role === 'MASTER',
        }))
      });
    }

    return NextResponse.json({
      message: 'User created successfully',
      user,
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
