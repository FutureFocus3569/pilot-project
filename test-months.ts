import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testMonthData() {
  try {
    console.log('🧪 Testing month-by-month data availability...\n');
    
    // Get centres with all occupancy data
    const centres = await prisma.centre.findMany({
      include: {
        occupancyData: {
          orderBy: { date: 'asc' }
        }
      },
      where: {
        occupancyData: {
          some: {} // Only centres with occupancy data
        }
      }
    });

    // Test a few specific months
    const testMonths = [
      { year: 2024, month: 1, name: 'January 2024' },
      { year: 2024, month: 6, name: 'June 2024' },
      { year: 2024, month: 12, name: 'December 2024' },
      { year: 2025, month: 3, name: 'March 2025' },
      { year: 2025, month: 6, name: 'June 2025' }
    ];

    for (const testMonth of testMonths) {
      console.log(`📅 ${testMonth.name}:`);
      
      for (const centre of centres) {
        const occupancyData = centre.occupancyData.find(data => {
          const dataDate = new Date(data.date);
          return dataDate.getFullYear() === testMonth.year && (dataDate.getMonth() + 1) === testMonth.month;
        });
        
        if (occupancyData) {
          console.log(`  ✅ ${centre.name}: ${occupancyData.totalCount} total, ${occupancyData.u2Count} u2, ${occupancyData.o2Count} o2`);
        } else {
          console.log(`  ❌ ${centre.name}: No data`);
        }
      }
      console.log('');
    }

    // Show the full range available
    const allDates = centres[0]?.occupancyData.map(d => {
      const date = new Date(d.date);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    }).sort();
    
    if (allDates && allDates.length > 0) {
      console.log(`📊 Full range available: ${allDates[0]} to ${allDates[allDates.length - 1]}`);
      console.log(`📈 Total months: ${allDates.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMonthData();
