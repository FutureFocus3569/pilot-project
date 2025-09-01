

import { createClient } from '@supabase/supabase-js';

// --- Batch update all Xero connections with new tokens ---
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const connections = [
  {
    tenant_id: '08b98d52-d3b2-4c47-b4ec-ef371f58cf60',
    centre: 'Future Focus - Terrace Views',
  },
  {
    tenant_id: '5a5addf5-dd46-4b62-bf61-afcfbde59d90',
    centre: 'Future Focus - The Boulevard',
  },
  {
    tenant_id: '613cb02c-c997-49f9-bf2c-7b4eebb571d2',
    centre: 'Future Focus - Papamoa Beach',
  },
  {
    tenant_id: '63251a82-8296-433a-92ed-faf696756545',
    centre: 'Future Focus - The Bach',
  },
  {
    tenant_id: '8ee192cc-ac9d-46fd-8796-c653ded3753f',
    centre: 'Future Focus - Livingstone Drive',
  },
  {
    tenant_id: 'b39bba96-4062-4223-a917-26f9f347d9e6',
    centre: 'Future Focus - West Dune Limited',
  },
];

const access_token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFDQUY4RTY2NzcyRDZEQzAyOEQ2NzI2RkQwMjYxNTgxNTcwRUZDMTkiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJISy1PWm5jdGJjQW8xbkp2MENZVmdWY09fQmsifQ.eyJuYmYiOjE3NTU2NDE5OTUsImV4cCI6MTc1NTY0Mzc5NSwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS54ZXJvLmNvbSIsImF1ZCI6Imh0dHBzOi8vaWRlbnRpdHkueGVyby5jb20vcmVzb3VyY2VzIiwiY2xpZW50X2lkIjoiN0M1NzhFMzIwQjYzNDI0Mjk2MTE0RkVFQTcyNzJFNTYiLCJzdWIiOiI1NDRjZjNiZjdiYjE1YjU2YjIwZjMxNGJiNGFmNzQyMSIsImF1dGhfdGltZSI6MTc1NTY0MTk4NywieGVyb191c2VyaWQiOiIzZTE4NDYzMC1lZTczLTRkYTktYjkzYi03ZDNlNGQzNTRiYWEiLCJnbG9iYWxfc2Vzc2lvbl9pZCI6ImEyNjU3OWJlNGE3ZjRmNGRiNGVlMzI5ZDIyYzhhYTk4Iiwic2lkIjoiYTI2NTc5YmU0YTdmNGY0ZGI0ZWUzMjlkMjJjOGFhOTgiLCJhdXRoZW50aWNhdGlvbl9ldmVudF9pZCI6IjA2ZjdhZjZmLWFhODEtNDE1OS04ZTRjLTAyYWU2Yjc0NGViYSIsImp0aSI6IjkzNEZDRjFGMzkxQjQ4OENBQjc5ODM5QzY1NTA1NEEzIiwic2NvcGUiOlsiZW1haWwiLCJwcm9maWxlIiwib3BlbmlkIiwiYWNjb3VudGluZy5jb250YWN0cy5yZWFkIiwiYWNjb3VudGluZy5zZXR0aW5ncyIsImFjY291bnRpbmcuc2V0dGluZ3MucmVhZCIsImFjY291bnRpbmcucmVwb3J0cy5yZWFkIiwiYWNjb3VudGluZy5qb3VybmFscy5yZWFkIiwiYWNjb3VudGluZy50cmFuc2FjdGlvbnMiLCJhY2NvdW50aW5nLnRyYW5zYWN0aW9ucy5yZWFkIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbImxlZ2FjeSJdfQ.y8bQcQVNWIquhGCMeoK95NiOS2YPH2CdQSrqCD12o4MYEtyb5T4R8s0cXk8DkQh3dNTuLsUVyx930LHnLu10ZpRUXqlBgfjUMAiEuby5UkpzxnSNYWvad-vWIRmV3Lq5MXqd7f5doFmoLCApfdP9bwYy0-WCRbPGqXz6E32qBGp0_vS1lkB2VqgtkCHtKinPddw7ib5k21nz0zlb2wg-Gobhn4zOzX2RHmtS4M3ZAGKRnnxLT8s1Ug2YXb_melDaMGUEOSBUEa1Cum0EhCln9JLSb08UdFe7dFg5cw0P2nEykqIIJsNnOwAFFcCol8ptRhHUIWXb0wTaOuef8R8zjw';
const refresh_token = 'jJil95vJdEw4va5yr50w5LnXRDnPgklUtfoWTRNuwLs';

async function updateAllConnections() {
  for (const conn of connections) {
    const { error } = await supabase
      .from('xero_connections')
      .update({ access_token, refresh_token })
      .eq('tenant_id', conn.tenant_id);
    if (error) {
      console.error(`Failed to update ${conn.centre}:`, error.message);
    } else {
      console.log(`Updated tokens for ${conn.centre}`);
    }
  }
  console.log('All Xero connections updated.');
}

updateAllConnections();

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...');

    // Create organization
    const organization = await prisma.organization.upsert({
      where: { slug: 'futurefocus' },
      update: {},
      create: {
        name: 'Future Focus Childcare',
        slug: 'futurefocus',
      },
    });

    console.log('✅ Organization created:', organization.name);

    // Hash the password for master user
    const hashedPassword = await bcrypt.hash('1234', 12);

    // Create master user
    const masterUser = await prisma.user.upsert({
      where: { email: 'courtney@futurefocus.co.nz' },
      update: {
        password: hashedPassword,
      },
      create: {
        name: 'Courtney Everest',
        email: 'courtney@futurefocus.co.nz',
        password: hashedPassword,
        role: 'MASTER',
  centreId: organization.id,
      },
    });

    console.log('✅ Master user created:', masterUser.email);

    // Create some sample centres
    const centre1 = await prisma.centre.upsert({
      where: { code: 'CC1' },
      update: {},
      create: {
        name: 'Future Focus Main Centre',
        code: 'CC1',
        address: '123 Childcare Street, Auckland',
        phone: '+64 9 123 4567',
        capacity: 80,

  organization: { connect: { id: organization.id } },

      },
    });

    const centre2 = await prisma.centre.upsert({
      where: { code: 'CC2' },
      update: {},
      create: {
        name: 'Future Focus East Centre',
        code: 'CC2',
        address: '456 Early Learning Ave, Auckland',
        phone: '+64 9 987 6543',
        capacity: 60,

  organization: { connect: { id: organization.id } },

      },
    });

    console.log('✅ Sample centres created');

    // Add some sample occupancy data
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await prisma.occupancyData.upsert({
      where: {
        centreId_date: {
          centreId: centre1.id,
          date: today,
        },
      },
      update: {},
      create: {
        centreId: centre1.id,
        date: today,
        u2Count: 25,
        o2Count: 45,
        totalCount: 70,
      },
    });

    await prisma.occupancyData.upsert({
      where: {
        centreId_date: {
          centreId: centre2.id,
          date: today,
        },
      },
      update: {},
      create: {
        centreId: centre2.id,
        date: today,
        u2Count: 20,
        o2Count: 35,
        totalCount: 55,
      },
    });

    console.log('✅ Sample occupancy data added');

    console.log('🎉 Database setup complete!');
    console.log('');
    console.log('You can now login with:');
    console.log('Email: courtney@futurefocus.co.nz');
    console.log('Password: 1234');
    console.log('');
    console.log('Your organization: Future Focus Childcare');
    console.log('Centres: CC1 (Main Centre), CC2 (East Centre)');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
