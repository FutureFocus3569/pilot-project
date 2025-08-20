import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Try to create the organization table data
    console.log('Creating organization...');
    const org = await prisma.organization.create({
      data: {
        name: 'Future Focus Childcare',
        slug: 'futurefocus',
      },
    });
    console.log('✅ Organization created:', org);
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
