import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCentres() {
  try {
    const centres = await prisma.centre.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log('Current centres in database:');
    centres.forEach(centre => {
      console.log(`- ${centre.name} (${centre.code})`);
    });
    
    // Count occupancy data for each centre
    for (const centre of centres) {
      const count = await prisma.occupancyData.count({
        where: { centreId: centre.id }
      });
      console.log(`  ${centre.name}: ${count} occupancy records`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCentres();
