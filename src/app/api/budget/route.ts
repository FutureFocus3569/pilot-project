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
    const hasXeroAccess = user.pagePermissions.some((p: any) => p.page === 'XERO');
    if (!hasXeroAccess) {
      return NextResponse.json({ error: 'No access to Xero page' }, { status: 403 });
    }

    // Get centres user has access to
    const accessibleCentres = user.centrePermissions.map((cp: any) => cp.centre);

    // If specific centre requested, check access
    if (centreId) {
      const hasAccessToCentre = accessibleCentres.some((c: any) => c.id === centreId);
      if (!hasAccessToCentre) {
        return NextResponse.json({ error: 'No access to this centre' }, { status: 403 });
      }
    }

    // Get centres user has access to
    const centreIds = centreId ? [centreId] : accessibleCentres.map((c: any) => c.id);
    
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

    // Format the data for the frontend
    const formattedData = budgetData.reduce((acc: any, item: any) => {
      const centreKey = item.centreId;
      if (!acc[centreKey]) {
        acc[centreKey] = {
          centre: item.centre,
          categories: []
        };
      }

      // Calculate monthly data
      const monthlyData: { [key: string]: number } = {};
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG'];
      
      months.forEach((month, index) => {
        const monthData = item.expenses.find((e: any) => e.month === index + 1);
        monthlyData[month] = monthData ? Number(monthData.actualAmount) : 0;
      });

      const totalActual = item.expenses.reduce((sum: number, expense: any) => sum + Number(expense.actualAmount), 0);
      const monthlyBudget = Number(item.monthlyBudget);
      const variance = monthlyBudget - totalActual;

      acc[centreKey].categories.push({
        category: item.category.name,
        monthlyBudget,
        actualSpend: totalActual,
        variance,
        monthlyData
      });

      return acc;
    }, {} as any);

    return NextResponse.json({
      centres: accessibleCentres,
      budgetData: formattedData
    });

  } catch (error) {
    console.error('Budget API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
