import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/user-service';
import { requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Require MASTER or ADMIN role
    const authResult = requireRole(req, ['MASTER', 'ADMIN']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const users = await userService.getAllUsers();
    
    return NextResponse.json({
      users,
      isUsingDatabase: userService.isUsingDatabase(),
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Require MASTER role for creating users
    const authResult = requireRole(req, ['MASTER']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { name, email, password, role, centreIds } = await req.json();

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user
    const user = await userService.createUser({
      name,
      email,
      password,
      role,
      organizationId: 'org_1', // Default organization for now
      centreIds,
    });

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
