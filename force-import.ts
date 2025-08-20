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

async function forceFullImport() {
  try {
    console.log('🚀 Starting comprehensive data import...');

    // Step 1: Clean up all existing occupancy data
    console.log('🧹 Cleaning up existing occupancy data...');
    await prisma.occupancyData.deleteMany({});
    console.log('✅ Cleaned up existing occupancy data');

    // Step 2: Read and parse CSV with better error handling
    const csvPath = path.join(process.cwd(), 'occupancy-data.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');
    
    console.log(`📄 Total lines in CSV: ${lines.length}`);
    
    // Find the header line and skip title lines
    let headerIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('centreName')) {
        headerIndex = i;
        break;
      }
    }
    
    console.log(`📍 Header found at line ${headerIndex + 1}: ${lines[headerIndex]}`);
    
    // Parse CSV data with explicit validation
    const csvData: CSVRow[] = [];
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      const values = line.split(',').map(v => v.trim());
      if (values.length >= 5 && values[0] && values[1]) {
        const row = {
          centreName: values[0],
          month: values[1],
          u2: parseInt(values[2]) || 0,
          o2: parseInt(values[3]) || 0,
          total: parseInt(values[4]) || 0
        };
        csvData.push(row);
        
        // Debug: Show June 2025 records
        if (row.month === '2025-06') {
          console.log(`🎯 Found June 2025 data: ${row.centreName} - ${row.total} total`);
        }
      } else {
        console.log(`⚠️ Skipping invalid line ${i + 1}: ${line}`);
      }
    }

    console.log(`📊 Parsed ${csvData.length} valid records`);
    
    // Show date range
    const dates = csvData.map(r => r.month).sort();
    console.log(`📅 Date range: ${dates[0]} to ${dates[dates.length - 1]}`);

    // Get organization
    const organization = await prisma.organization.findFirst({
      where: { slug: 'futurefocus' }
    });

    if (!organization) {
      console.error('❌ Organization not found. Please run setup first.');
      return;
    }

    // Set up centres
    const centreDefinitions = [
      { name: 'Papamoa Beach', code: 'PB1', capacity: 120 },
      { name: 'The Boulevard', code: 'TB1', capacity: 100 },
      { name: 'The Bach', code: 'BC1', capacity: 90 },
      { name: 'Terrace Views', code: 'TV1', capacity: 110 },
      { name: 'Livingstone Drive', code: 'LD1', capacity: 80 },
      { name: 'West Dune', code: 'WD1', capacity: 100 },
    ];

    console.log('🏢 Setting up centres...');
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

    // Import occupancy data with detailed logging
    let importedCount = 0;
    let skippedCount = 0;
    let june2025Count = 0;

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
        
        if (row.month === '2025-06') {
          june2025Count++;
          console.log(`✅ June 2025: ${row.centreName} - ${row.total} total imported`);
        }
        
      } catch (error) {
        console.error(`❌ Error importing row:`, row, error);
        skippedCount++;
      }
    }

    console.log('🎉 Import completed!');
    console.log(`✅ Total imported: ${importedCount} records`);
    console.log(`🎯 June 2025 imported: ${june2025Count} records`);
    console.log(`⚠️ Skipped: ${skippedCount} records`);

    // Final verification
    const finalCheck = await prisma.occupancyData.aggregate({
      _min: { date: true },
      _max: { date: true }
    });
    
    console.log('\n📈 Final database state:');
    console.log(`From: ${finalCheck._min.date}`);
    console.log(`To: ${finalCheck._max.date}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

forceFullImport();
