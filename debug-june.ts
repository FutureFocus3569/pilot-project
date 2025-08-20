import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugJuneImport() {
  try {
    console.log('🔍 Testing June 2025 date conversion...');
    
    // Test the date conversion for June 2025
    const testMonth = '2025-06';
    const [year, month] = testMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    
    console.log(`Input: ${testMonth}`);
    console.log(`Year: ${year}, Month: ${month}`);
    console.log(`Created date: ${date.toISOString()}`);
    console.log(`Date string: ${date.toString()}`);
    
    // Get organization
    const organization = await prisma.organization.findFirst({
      where: { slug: 'futurefocus' }
    });

    // Get a centre
    const centre = await prisma.centre.findFirst({
      where: { name: 'Papamoa Beach' }
    });

    if (organization && centre) {
      console.log('\n🧪 Testing manual June 2025 record creation...');
      
      // Try to create a test June record
      const testRecord = await prisma.occupancyData.create({
        data: {
          centreId: centre.id,
          date: date,
          u2Count: 77,
          o2Count: 90,
          totalCount: 87
        }
      });
      
      console.log(`✅ Test record created: ${testRecord.id}`);
      console.log(`Saved date: ${testRecord.date.toISOString()}`);
      
      // Check if we can find it
      const foundRecord = await prisma.occupancyData.findUnique({
        where: { id: testRecord.id }
      });
      
      if (foundRecord) {
        console.log('✅ Test record found in database');
        console.log(`Retrieved date: ${foundRecord.date.toISOString()}`);
      } else {
        console.log('❌ Test record not found');
      }
      
      // Clean up
      await prisma.occupancyData.delete({
        where: { id: testRecord.id }
      });
      console.log('🧹 Test record cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugJuneImport();
