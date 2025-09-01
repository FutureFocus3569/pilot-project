import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a default organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'main-childcare-org' },
    update: {},
    create: {
      name: 'Main Childcare Organization',
      slug: 'main-childcare-org',
    },
  });

  console.log('Created organization:', organization.name);

  // Create the 6 childcare centres
  const centres = [
    {
      name: 'Sunshine Kids Centre',
      code: 'CC1',
      capacity: 50,
      address: '123 Sunshine Street, Auckland',
      phone: '+64 9 123 4567',
    },
    {
      name: 'Rainbow Learning Centre',
      code: 'CC2',
      capacity: 60,
      address: '456 Rainbow Road, Wellington',
      phone: '+64 4 234 5678',
    },
    {
      name: 'Little Stars Daycare',
      code: 'CC3',
      capacity: 45,
      address: '789 Stars Avenue, Christchurch',
      phone: '+64 3 345 6789',
    },
    {
      name: 'Happy Hearts Centre',
      code: 'CC4',
      capacity: 55,
      address: '321 Hearts Lane, Hamilton',
      phone: '+64 7 456 7890',
    },
    {
      name: 'Bright Beginnings',
      code: 'CC5',
      capacity: 40,
      address: '654 Bright Boulevard, Tauranga',
      phone: '+64 7 567 8901',
    },
    {
      name: 'Future Leaders Centre',
      code: 'CC6',
      capacity: 65,
      address: '987 Leaders Drive, Dunedin',
      phone: '+64 3 678 9012',
    },
  ];

  for (const centreData of centres) {
    const centre = await prisma.centre.upsert({
      where: { code: centreData.code },
      update: centreData,
      create: {
  ...centreData,
  organization: { connect: { id: organization.id } },
      },
    });
    console.log(`Created/updated centre: ${centre.name} (${centre.code})`);
  }

  // Create a master user
  const masterUser = await prisma.user.upsert({
    where: { email: 'admin@childcaredashboard.com' },
    update: {},
    create: {
      email: 'admin@childcaredashboard.com',
      name: 'Master Administrator',
      password: 'hashed_password_here', // In real app, this should be properly hashed
      role: 'MASTER',
  centreId: organization.id,
    },
  });

  console.log('Created master user:', masterUser.email);
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
