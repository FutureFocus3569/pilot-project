import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '2025');

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: authUser.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has admin access
    const hasAdminAccess = user.role === 'MASTER' || user.role === 'ADMIN';
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // For now, return mock budget data
    // In production, this would come from a proper budget table
    const mockBudgets = [
      {
        id: '1',
        centreId: '1',
        categoryId: 'art-messy-play',
        monthlyBudget: 300,
        centre: { id: '1', name: 'Papamoa Beach', code: 'PB1' },
        category: { id: 'art-messy-play', name: 'Art and Messy Play' }
      },
      {
        id: '2',
        centreId: '1',
        categoryId: 'food-costs',
        monthlyBudget: 3750,
        centre: { id: '1', name: 'Papamoa Beach', code: 'PB1' },
        category: { id: 'food-costs', name: 'Food Costs' }
      }
    ];

    return NextResponse.json(mockBudgets);

  } catch (error) {
    console.error('Budget management API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { centreId, categoryId, monthlyBudget, year } = body;

    if (!centreId || !categoryId || monthlyBudget === undefined || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: authUser.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has admin access
    const hasAdminAccess = user.role === 'MASTER' || user.role === 'ADMIN';
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // For now, simulate saving the budget
    // In production, this would save to a proper budget table
    console.log('Saving budget:', { centreId, categoryId, monthlyBudget, year });

    // Return mock saved budget
    const savedBudget = {
      id: `${centreId}-${categoryId}-${year}`,
      centreId,
      categoryId,
      monthlyBudget,
      year,
      centre: { id: centreId, name: 'Mock Centre', code: 'MC1' },
      category: { id: categoryId, name: 'Mock Category' }
    };

    return NextResponse.json(savedBudget);

  } catch (error) {
    console.error('Budget management save error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
