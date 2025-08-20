import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleActualExpenses() {
  try {
    console.log('🚀 Creating sample actual expenses for demonstration...');

    // Get Papamoa Beach centre and its budget categories
    const papamoaBeach = await prisma.centre.findFirst({
      where: { name: 'Papamoa Beach' },
      include: {
        centreBudgetCategories: {
          include: {
            category: true
          }
        }
      }
    });

    if (!papamoaBeach) {
      console.error('❌ Papamoa Beach centre not found');
      return;
    }

    console.log(`✅ Found ${papamoaBeach.centreBudgetCategories.length} budget categories for ${papamoaBeach.name}`);

    // Create actual expenses for Jan-Aug 2025 (8 months so far)
    const months = [1, 2, 3, 4, 5, 6, 7, 8]; // Jan through Aug 2025
    const year = 2025;

    for (const centreBudgetCategory of papamoaBeach.centreBudgetCategories) {
      console.log(`📊 Creating expenses for: ${centreBudgetCategory.category.name}`);
      
      for (const month of months) {
        // Generate realistic actual expenses (80-120% of budget with some variation)
        const budget = Number(centreBudgetCategory.monthlyBudget);
        const variance = (Math.random() - 0.5) * 0.4; // ±20% base variance
        const seasonalFactor = month <= 2 || month >= 11 ? 1.1 : 1.0; // Higher costs in summer
        const actualAmount = Math.round(budget * (1 + variance) * seasonalFactor);

        try {
          await prisma.actualExpense.create({
            data: {
              centreBudgetCategoryId: centreBudgetCategory.id,
              categoryId: centreBudgetCategory.categoryId,
              year: year,
              month: month,
              actualAmount: actualAmount,
              xeroTransactionId: `DEMO-${centreBudgetCategory.id}-${year}-${month}`,
              xeroSyncDate: new Date()
            }
          });
        } catch (error: any) {
          if (error.code !== 'P2002') { // Ignore unique constraint errors
            console.error(`❌ Error creating expense for ${centreBudgetCategory.category.name} ${month}/${year}:`, error);
          }
        }
      }
    }

    // Create sample data for one more centre - The Boulevard
    const theBoulevard = await prisma.centre.findFirst({
      where: { name: 'The Boulevard' }
    });

    if (theBoulevard) {
      // Set up a few budget categories for The Boulevard
      const budgetCategories = await prisma.budgetCategory.findMany({
        where: {
          name: { in: ['Food Costs', 'Cleaning Supplies', 'Art and Messy Play'] }
        }
      });

      for (const category of budgetCategories) {
        const budgets = {
          'Food Costs': 3200,
          'Cleaning Supplies': 900,
          'Art and Messy Play': 250
        };

        const monthlyBudget = budgets[category.name as keyof typeof budgets] || 500;

        // Create or get centre budget category
        const centreBudgetCategory = await prisma.centreBudgetCategory.upsert({
          where: {
            centreId_categoryId: {
              centreId: theBoulevard.id,
              categoryId: category.id
            }
          },
          update: {},
          create: {
            centreId: theBoulevard.id,
            categoryId: category.id,
            monthlyBudget: monthlyBudget,
            xeroAccountCode: `6${category.name.slice(0, 3).toUpperCase()}`,
            xeroAccountName: category.name,
            isActive: true
          }
        });

        // Create actual expenses
        for (const month of months) {
          const budget = monthlyBudget;
          const variance = (Math.random() - 0.5) * 0.3;
          const actualAmount = Math.round(budget * (1 + variance));

          try {
            await prisma.actualExpense.create({
              data: {
                centreBudgetCategoryId: centreBudgetCategory.id,
                categoryId: category.id,
                year: year,
                month: month,
                actualAmount: actualAmount,
                xeroTransactionId: `DEMO-${centreBudgetCategory.id}-${year}-${month}`,
                xeroSyncDate: new Date()
              }
            });
          } catch (error: any) {
            if (error.code !== 'P2002') {
              console.error(`❌ Error creating expense:`, error);
            }
          }
        }
      }
      console.log(`✅ Created sample data for ${theBoulevard.name}`);
    }

    console.log('\n🎉 Sample actual expenses created!');
    console.log('📊 You can now view realistic budget vs actuals on the Xero page.');

  } catch (error) {
    console.error('❌ Failed to create sample expenses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleActualExpenses();
