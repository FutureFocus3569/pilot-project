import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setupMasterUser() {
  try {
    console.log('🚀 Setting up master user...');

    // Get the existing organization or use the one we just created
    let organization = await prisma.organization.findFirst({
      where: { slug: 'futurefocus' }
    });

    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          name: 'Future Focus Childcare',
          slug: 'futurefocus',
        },
      });
      console.log('✅ Organization created:', organization.name);
    } else {
      console.log('✅ Using existing organization:', organization.name);
    }

    // Hash the password for master user
    const hashedPassword = await bcrypt.hash('1234', 12);

    // Create or update master user
    const masterUser = await prisma.user.upsert({
      where: { email: 'courtney@futurefocus.co.nz' },
      update: {
        password: hashedPassword,
        name: 'Courtney Everest',
        role: 'MASTER',
      },
      create: {
        name: 'Courtney Everest',
        email: 'courtney@futurefocus.co.nz',
        password: hashedPassword,
        role: 'MASTER',
        organizationId: organization.id,
      },
    });

    console.log('✅ Master user set up:', masterUser.email);
    console.log('');
    console.log('🎉 Setup complete!');
    console.log('You can now login with:');
    console.log('Email: courtney@futurefocus.co.nz');
    console.log('Password: 1234');
    console.log('');
    console.log('The user management system is now connected to your Supabase database!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupMasterUser();
