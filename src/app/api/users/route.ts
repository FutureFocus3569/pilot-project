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

    // Create user using Supabase
    // Use centreId from request if provided, else fallback to 'centre_1'
    const { supabaseUserService } = await import('@/lib/supabase-user-service');
    const user = await supabaseUserService.createUser({
      name,
      email,
      password,
      role,
      centreId: centreIds && centreIds.length > 0 ? centreIds[0] : 'centre_1',
    });

    return NextResponse.json({
      message: 'User created successfully (via Supabase)',
      user,
    });

  } catch (error) {
    console.error('Error creating user:', error);
    // Return the actual error message for debugging
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : error?.toString()) || 'Internal server error' },
      { status: 500 }
    );
  }
}
