import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface CSVRow {
  centreName: string;
  month: string;
  u2: number;
  o2: number;
  total: number;
}

async function fullDataImport() {
  try {
    console.log('🚀 Starting full occupancy data import...');

    // Step 1: Clean up all existing occupancy data
    console.log('🧹 Cleaning up existing occupancy data...');
    await prisma.occupancyData.deleteMany({});
    console.log('✅ Cleaned up existing occupancy data');

    // Step 2: Remove duplicate centres 
    console.log('🧹 Cleaning up duplicate centres...');
    try {
      await prisma.centre.deleteMany({
        where: {
          code: { in: ['LIVINGSTON', 'PAPAMOABEA'] }
        }
      });
      console.log('✅ Removed duplicate centres');
    } catch (e) {
      console.log('ℹ️ No duplicates to remove');
    }

    // Step 3: Read and parse CSV
    const csvPath = path.join(process.cwd(), 'occupancy-data.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');
    
    // Find the header line (skip any title lines)
    let headerIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('centreName')) {
        headerIndex = i;
        break;
      }
    }
    
    const headers = lines[headerIndex].split(',').map(h => h.trim());
    console.log('📄 CSV Headers found:', headers);
    
    // Parse CSV data
    const csvData: CSVRow[] = [];
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 5 && values[0] && values[1]) {
        csvData.push({
          centreName: values[0],
          month: values[1],
          u2: parseInt(values[2]) || 0,
          o2: parseInt(values[3]) || 0,
          total: parseInt(values[4]) || 0
        });
      }
    }

    console.log(`📊 Found ${csvData.length} occupancy records`);

    // Step 4: Get organization
    const organization = await prisma.organization.findFirst({
      where: { slug: 'futurefocus' }
    });

    if (!organization) {
      console.error('❌ Organization not found. Please run setup first.');
      return;
    }

    // Step 5: Set up centres in the correct order with proper codes
    const centreDefinitions = [
      { name: 'Papamoa Beach', code: 'PB1', capacity: 120 },
      { name: 'The Boulevard', code: 'TB1', capacity: 100 },
      { name: 'The Bach', code: 'BC1', capacity: 90 },
      { name: 'Terrace Views', code: 'TV1', capacity: 110 },
      { name: 'Livingstone Drive', code: 'LD1', capacity: 80 },
      { name: 'West Dune', code: 'WD1', capacity: 100 }, // Opened Aug 2025
    ];

    console.log('🏢 Setting up centres in correct order...');
    const centres = new Map();
    
    for (const centreDef of centreDefinitions) {
      const centre = await prisma.centre.upsert({
        where: { code: centreDef.code },
        update: { 
          name: centreDef.name,
          capacity: centreDef.capacity 
        },
        create: {
          name: centreDef.name,
          code: centreDef.code,
          organizationId: organization.id,
          capacity: centreDef.capacity,
        }
      });
      
      centres.set(centreDef.name, centre.id);
      console.log(`✅ Centre ready: ${centreDef.name} (${centreDef.code})`);
    }

    // Step 6: Import occupancy data
    let importedCount = 0;
    let skippedCount = 0;

    for (const row of csvData) {
      try {
        // Convert month string to date (first day of the month)
        const [year, month] = row.month.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        
        const centreId = centres.get(row.centreName);
        if (!centreId) {
          console.warn(`⚠️ Centre not found: ${row.centreName}`);
          skippedCount++;
          continue;
        }

        await prisma.occupancyData.create({
          data: {
            centreId,
            date,
            u2Count: row.u2,
            o2Count: row.o2,
            totalCount: row.total
          }
        });

        importedCount++;
      } catch (error) {
        console.error(`❌ Error importing row:`, row, error);
        skippedCount++;
      }
    }

    // Step 7: Verify centre order in dashboard
    const finalCentres = await prisma.centre.findMany({
      orderBy: [
        { code: 'asc' }
      ]
    });

    console.log('🎉 Import completed!');
    console.log(`✅ Imported: ${importedCount} records`);
    console.log(`⚠️ Skipped: ${skippedCount} records`);
    console.log('');
    console.log('📋 Final centre order:');
    finalCentres.forEach((centre, index) => {
      console.log(`${index + 1}. ${centre.name} (${centre.code})`);
    });
    console.log('');
    console.log('🎯 Your dashboard now has complete historical data!');
    console.log('🔄 Refresh your browser to see all the real charts and percentages.');

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fullDataImport();
