import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDateRanges() {
  try {
    // Get date range of all occupancy data
    const dateRange = await prisma.occupancyData.aggregate({
      _min: { date: true },
      _max: { date: true }
    });
    
    console.log('Date range in database:');
    console.log(`From: ${dateRange._min.date}`);
    console.log(`To: ${dateRange._max.date}`);
    
    // Get all unique dates
    const allDates = await prisma.occupancyData.findMany({
      select: { date: true },
      distinct: ['date'],
      orderBy: { date: 'asc' }
    });
    
    console.log('\nAll months in database:');
    allDates.forEach(record => {
      const date = new Date(record.date);
      console.log(`- ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`);
    });
    
    // Check recent data for one centre
    console.log('\nRecent data for Papamoa Beach:');
    const recentData = await prisma.occupancyData.findMany({
      where: {
        centre: {
          name: 'Papamoa Beach'
        }
      },
      orderBy: { date: 'desc' },
      take: 5,
      include: {
        centre: true
      }
    });
    
    recentData.forEach(record => {
      const date = new Date(record.date);
      console.log(`${date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}: ${record.totalCount} total, ${record.u2Count} u2, ${record.o2Count} o2`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDateRanges();
