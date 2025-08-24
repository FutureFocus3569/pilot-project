
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
  const accessibleCentres = user.centrePermissions.map((cp: { centre: Centre }) => cp.centre);

    // If specific centre requested, check access
    if (centreId) {
      const hasAccessToCentre = accessibleCentres.some((c: { id: string }) => c.id === centreId);
      if (!hasAccessToCentre) {
        return NextResponse.json({ error: 'No access to this centre' }, { status: 403 });
      }
    }

    // Get centres user has access to
  const centreIds = centreId ? [centreId] : accessibleCentres.map((c: Centre) => c.id);
    
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
  type Expense = { month: number; actualAmount: number };
    type Category = { name: string };
    type Centre = { id: string };
    type BudgetItem = {
      centreId: string;
      centre: Centre;
      category: Category;
      monthlyBudget: number;
      expenses: Expense[];
    };
    interface FormattedCategory {
      category: string;
      monthlyBudget: number;
      actualSpend: number;
      variance: number;
      monthlyData: { [key: string]: number };
    }
    interface FormattedData {
      [centreKey: string]: {
        centre: Centre;
        categories: FormattedCategory[];
      };
    }
    // Convert Prisma Decimal fields to number for compatibility
    const formattedData = budgetData.reduce<FormattedData>((acc, item: Record<string, unknown>) => {
      const centreKey = item.centreId as string;
      // Convert Decimal to number for monthlyBudget and actualAmount
      const monthlyBudget = typeof item.monthlyBudget === 'object' && item.monthlyBudget !== null && typeof (item.monthlyBudget as { toNumber?: () => number }).toNumber === 'function'
        ? (item.monthlyBudget as { toNumber: () => number }).toNumber()
        : Number(item.monthlyBudget);
      const expenses: Expense[] = Array.isArray(item.expenses)
        ? (item.expenses as Array<Record<string, unknown>>).map((e) => ({
            month: Number(e.month),
            actualAmount: typeof e.actualAmount === 'object' && e.actualAmount !== null && typeof (e.actualAmount as { toNumber?: () => number }).toNumber === 'function'
              ? (e.actualAmount as { toNumber: () => number }).toNumber()
              : Number(e.actualAmount)
          }))
        : [];
      if (!acc[centreKey]) {
        acc[centreKey] = {
          centre: item.centre as Centre,
          categories: []
        };
      }

      // Calculate monthly data
      const monthlyData: { [key: string]: number } = {};
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG'];
      months.forEach((month, index) => {
        const monthData = expenses.find((e) => e.month === index + 1);
        monthlyData[month] = monthData ? Number(monthData.actualAmount) : 0;
      });

      const totalActual = expenses.reduce((sum: number, expense) => sum + Number(expense.actualAmount), 0);
      const variance = monthlyBudget - totalActual;

      acc[centreKey].categories.push({
        category: (item.category as Category).name,
        monthlyBudget,
        actualSpend: totalActual,
        variance,
        monthlyData
      });

      return acc;
    }, {});

    return NextResponse.json({
      centres: accessibleCentres,
      budgetData: formattedData
    });

  } catch (error) {
    console.error('Budget API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
