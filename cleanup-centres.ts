import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicates() {
  try {
    console.log('🧹 Cleaning up duplicate centres...');
    
    // Delete the auto-generated duplicates (the ones with ugly codes)
    await prisma.centre.delete({
      where: { code: 'LIVINGSTON' }
    });
    console.log('✅ Removed duplicate Livingstone Drive');
    
    await prisma.centre.delete({
      where: { code: 'PAPAMOABEA' }
    });
    console.log('✅ Removed duplicate Papamoa Beach');
    
    console.log('🎉 Cleanup complete!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicates();
