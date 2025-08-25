import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/user-service';
import { requireRole } from '@/lib/auth';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(
  req: NextRequest,
  ctx: Ctx
) {
  try {
    const authResult = requireRole(req, ['MASTER', 'ADMIN']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await ctx.params;
    const user = await userService.getUserById(id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  ctx: Ctx
) {
  try {
    const authResult = requireRole(req, ['MASTER']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { name, email, role, isActive, centreIds } = await req.json();

    const { id } = await ctx.params;
    const user = await userService.updateUser(id, {
      name,
      email,
      role,
      isActive,
      centreIds,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User updated successfully',
      user,
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: Ctx
) {
  try {
    const authResult = requireRole(req, ['MASTER']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await ctx.params;
    const success = await userService.deleteUser(id);

    if (!success) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
