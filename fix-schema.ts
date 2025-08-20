import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addMissingColumns() {
  try {
    console.log('Adding missing columns...');
    
    // Add isActive column
    await prisma.$executeRaw`ALTER TABLE users ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true`;
    console.log('✅ Added isActive column');

    // Check if UserCentrePermission table exists, if not create it
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'user_centre_permissions'
    `;
    
    if (!Array.isArray(tables) || tables.length === 0) {
      console.log('Creating user_centre_permissions table...');
      await prisma.$executeRaw`
        CREATE TABLE "user_centre_permissions" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "centreId" TEXT NOT NULL,
          "canViewOccupancy" BOOLEAN NOT NULL DEFAULT true,
          "canEditOccupancy" BOOLEAN NOT NULL DEFAULT false,
          "canViewFinancials" BOOLEAN NOT NULL DEFAULT false,
          "canEditFinancials" BOOLEAN NOT NULL DEFAULT false,
          "canViewEnrollments" BOOLEAN NOT NULL DEFAULT true,
          "canEditEnrollments" BOOLEAN NOT NULL DEFAULT false,
          "canViewReports" BOOLEAN NOT NULL DEFAULT true,
          "canManageStaff" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          
          CONSTRAINT "user_centre_permissions_pkey" PRIMARY KEY ("id")
        )
      `;
      
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX "user_centre_permissions_userId_centreId_key" 
        ON "user_centre_permissions"("userId", "centreId")
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE "user_centre_permissions" 
        ADD CONSTRAINT "user_centre_permissions_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE "user_centre_permissions" 
        ADD CONSTRAINT "user_centre_permissions_centreId_fkey" 
        FOREIGN KEY ("centreId") REFERENCES "centres"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `;
      
      console.log('✅ Created user_centre_permissions table');
    }

    console.log('✅ Database schema updated');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingColumns();
