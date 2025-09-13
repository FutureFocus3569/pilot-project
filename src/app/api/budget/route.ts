
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const centreId = searchParams.get('centreId');

    // Get user with permissions
    const user = await prisma.user.findUnique({
      where: { email: authUser.email },
      include: {
        pagePermissions: true,
        centrePermissions: {
          include: {
            centre: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

  // Check if user has Xero page access
  const hasXeroAccess = user.pagePermissions.some((p: { page: string }) => p.page === 'XERO');
    if (!hasXeroAccess) {
      return NextResponse.json({ error: 'No access to Xero page' }, { status: 403 });
    }

  // Get centres user has access to
  const accessibleCentres = user.centrePermissions.map((cp) => cp.centre);

    // If specific centre requested, check access
    if (centreId) {
      const hasAccessToCentre = accessibleCentres.some((c: { id: string }) => c.id === centreId);
      if (!hasAccessToCentre) {
        return NextResponse.json({ error: 'No access to this centre' }, { status: 403 });
      }
    }

    // Get centres user has access to
  const centreIds = centreId ? [centreId] : accessibleCentres.map((c) => c.id);
    
    const budgetData = await prisma.centreBudgetCategory.findMany({
      where: {
        centreId: { in: centreIds }
      },
      include: {
        centre: true,
        category: true,
        expenses: {
          where: {
            year: 2025,
            month: { in: [1, 2, 3, 4, 5, 6, 7, 8] }
          },
          orderBy: { month: 'asc' }
        }
      }
    });


    // --- Refactored transformation for robust budget vs actuals matching ---
    // Output: { [centreName]: { [categoryName]: { [Month Year]: { budget, actual, variance } } } }
    const monthNames = [
      'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025',
      'May 2025', 'Jun 2025', 'Jul 2025', 'Aug 2025'
    ];

    const result: Record<string, Record<string, Record<string, { budget: number, actual: number, variance: number }>>> = {};

    for (const item of budgetData) {
      const centreName = item.centre?.name || item.centreId;
      const categoryName = item.category?.name || item.categoryId;
      // Convert Decimal to number for monthlyBudget
      const monthlyBudget = typeof item.monthlyBudget === 'object' && item.monthlyBudget !== null && typeof item.monthlyBudget.toNumber === 'function'
        ? item.monthlyBudget.toNumber() : Number(item.monthlyBudget);
      // Build a map of month -> actual
      const actualsByMonth: Record<number, number> = {};
      if (Array.isArray(item.expenses)) {
        for (const exp of item.expenses) {
          const monthNum = Number(exp.month);
          const actualAmount = typeof exp.actualAmount === 'object' && exp.actualAmount !== null && typeof exp.actualAmount.toNumber === 'function'
            ? exp.actualAmount.toNumber() : Number(exp.actualAmount);
          actualsByMonth[monthNum] = actualAmount;
        }
      }
      for (let i = 0; i < monthNames.length; ++i) {
        const monthNum = i + 1;
        const actual = actualsByMonth[monthNum] || 0;
        if (actual === 0) continue; // Ignore months where actual = 0
        if (!result[centreName]) result[centreName] = {};
        if (!result[centreName][categoryName]) result[centreName][categoryName] = {};
        result[centreName][categoryName][monthNames[i]] = {
          budget: monthlyBudget,
          actual,
          variance: monthlyBudget - actual
        };
      }
    }

    return NextResponse.json({
      data: result
    });

  } catch (error) {
    console.error('Budget API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
