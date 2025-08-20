import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkJuneData() {
  try {
    // Check for June 2025 data specifically
    const june2025Data = await prisma.occupancyData.findMany({
      where: {
        date: {
          gte: new Date('2025-06-01'),
          lt: new Date('2025-07-01')
        }
      },
      include: {
        centre: true
      },
      orderBy: [
        { centre: { name: 'asc' } },
        { date: 'asc' }
      ]
    });
    
    console.log(`\n🎯 June 2025 data in database: ${june2025Data.length} records`);
    
    if (june2025Data.length > 0) {
      june2025Data.forEach(record => {
        console.log(`- ${record.centre.name}: ${record.totalCount} total (${record.date.toISOString().substring(0, 7)})`);
      });
    } else {
      console.log('❌ No June 2025 data found in database');
      
      // Check what the latest data actually is
      const latestData = await prisma.occupancyData.findMany({
        orderBy: { date: 'desc' },
        take: 10,
        include: { centre: true }
      });
      
      console.log('\n📅 Latest 10 records in database:');
      latestData.forEach(record => {
        console.log(`- ${record.centre.name}: ${record.date.toISOString().substring(0, 10)} (${record.totalCount} total)`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJuneData();
