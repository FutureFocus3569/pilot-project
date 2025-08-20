import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setupBudgetSystem() {
  try {
    console.log('🚀 Setting up budget system with enhanced permissions...');

    // 1. Create organization
    const organization = await prisma.organization.create({
      data: {
        name: 'Future Focus Early Learning',
        slug: 'futurefocus'
      }
    });
    console.log('✅ Created organization');

    // 2. Create master user
    const hashedPassword = await bcrypt.hash('futurefocus2024', 12);
    const masterUser = await prisma.user.create({
      data: {
        email: 'courtney@futurefocus.co.nz',
        name: 'Courtney',
        password: hashedPassword,
        role: 'MASTER',
        organizationId: organization.id,
        isActive: true
      }
    });
    console.log('✅ Created master user');

    // 3. Create centres
    const centreDefinitions = [
      { name: 'Papamoa Beach', code: 'PB1', capacity: 120 },
      { name: 'The Boulevard', code: 'TB1', capacity: 100 },
      { name: 'The Bach', code: 'BC1', capacity: 90 },
      { name: 'Terrace Views', code: 'TV1', capacity: 110 },
      { name: 'Livingstone Drive', code: 'LD1', capacity: 80 },
      { name: 'West Dune', code: 'WD1', capacity: 100 },
    ];

    const centres = [];
    for (const centreDef of centreDefinitions) {
      const centre = await prisma.centre.create({
        data: {
          name: centreDef.name,
          code: centreDef.code,
          organizationId: organization.id,
          capacity: centreDef.capacity,
        }
      });
      centres.push(centre);
      console.log(`✅ Created centre: ${centreDef.name}`);
    }

    // 4. Create budget categories (from your screenshot)
    const budgetCategories = [
      { name: 'Art and Messy Play', description: 'Art supplies, sensory materials', sortOrder: 1 },
      { name: 'Centre Purchases', description: 'General centre equipment and supplies', sortOrder: 2 },
      { name: 'Cleaning Supplies', description: 'Cleaning products and maintenance', sortOrder: 3 },
      { name: 'Food Costs', description: 'Meals, snacks, kitchen supplies', sortOrder: 4 },
      { name: 'Kiri Classroom Resources', description: 'Educational materials for Kiri room', sortOrder: 5 },
      { name: 'Meeting Costs', description: 'Staff meetings, training costs', sortOrder: 6 },
      { name: 'Nappies and Wipes', description: 'Childcare hygiene supplies', sortOrder: 7 },
      { name: 'Nga Classroom Resources', description: 'Educational materials for Nga room', sortOrder: 8 },
      { name: 'Printing and Stationary', description: 'Office supplies, documentation', sortOrder: 9 },
      { name: 'Repairs and Maintenance', description: 'Equipment repairs, facility maintenance', sortOrder: 10 },
      { name: 'Wai Classroom Resources', description: 'Educational materials for Wai room', sortOrder: 11 }
    ];

    const categories = [];
    for (const categoryDef of budgetCategories) {
      const category = await prisma.budgetCategory.create({
        data: {
          name: categoryDef.name,
          description: categoryDef.description,
          sortOrder: categoryDef.sortOrder,
          isActive: true
        }
      });
      categories.push(category);
      console.log(`✅ Created budget category: ${categoryDef.name}`);
    }

    // 5. Create sample centre budget categories for Papamoa Beach (you can set up others later)
    const papamoaBeach = centres.find(c => c.name === 'Papamoa Beach');
    if (papamoaBeach) {
      const sampleBudgets = [
        { categoryName: 'Art and Messy Play', monthlyBudget: 300, xeroAccountCode: '6001' },
        { categoryName: 'Centre Purchases', monthlyBudget: 500, xeroAccountCode: '6002' },
        { categoryName: 'Cleaning Supplies', monthlyBudget: 1000, xeroAccountCode: '6003' },
        { categoryName: 'Food Costs', monthlyBudget: 3750, xeroAccountCode: '6004' },
        { categoryName: 'Nappies and Wipes', monthlyBudget: 800, xeroAccountCode: '6005' },
      ];

      for (const budget of sampleBudgets) {
        const category = categories.find(c => c.name === budget.categoryName);
        if (category) {
          await prisma.centreBudgetCategory.create({
            data: {
              centreId: papamoaBeach.id,
              categoryId: category.id,
              monthlyBudget: budget.monthlyBudget,
              xeroAccountCode: budget.xeroAccountCode,
              xeroAccountName: budget.categoryName,
              isActive: true
            }
          });
          console.log(`✅ Created budget for ${papamoaBeach.name}: ${budget.categoryName}`);
        }
      }
    }

    // 6. Give master user all page permissions
    const pages = ['DASHBOARD', 'XERO', 'MARKETING', 'DATA_MANAGEMENT', 'ADMIN', 'ASSISTANT'];
    for (const page of pages) {
      await prisma.userPagePermission.create({
        data: {
          userId: masterUser.id,
          page: page as any,
          canAccess: true
        }
      });
    }
    console.log('✅ Created master user page permissions');

    // 7. Give master user access to all centres
    for (const centre of centres) {
      await prisma.userCentrePermission.create({
        data: {
          userId: masterUser.id,
          centreId: centre.id,
          canViewOccupancy: true,
          canEditOccupancy: true,
          canViewFinancials: true,
          canEditFinancials: true,
          canViewEnrollments: true,
          canEditEnrollments: true,
          canViewReports: true,
          canManageStaff: true
        }
      });
    }
    console.log('✅ Created master user centre permissions');

    console.log('\n🎉 Budget system setup complete!');
    console.log('\n📋 Summary:');
    console.log(`- Organization: ${organization.name}`);
    console.log(`- Master user: ${masterUser.email}`);
    console.log(`- Centres: ${centres.length}`);
    console.log(`- Budget categories: ${categories.length}`);
    console.log(`- Sample budgets created for: ${papamoaBeach?.name}`);
    console.log('\n🔑 Next steps:');
    console.log('1. Re-import your occupancy data');
    console.log('2. Set up budget categories for other centres');
    console.log('3. Configure Xero integration');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupBudgetSystem();
