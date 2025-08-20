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

async function fixedImport() {
  try {
    console.log('🚀 Starting fixed June import...');

    // Clean up all existing data first
    console.log('🧹 Cleaning up existing occupancy data...');
    await prisma.occupancyData.deleteMany({});
    console.log('✅ Cleaned up existing occupancy data');

    // Read CSV
    const csvPath = path.join(process.cwd(), 'occupancy-data.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');
    
    // Find header
    let headerIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('centreName')) {
        headerIndex = i;
        break;
      }
    }
    
    // Parse CSV data
    const csvData: CSVRow[] = [];
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
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

    console.log(`📊 Found ${csvData.length} records to import`);

    // Get organization
    const organization = await prisma.organization.findFirst({
      where: { slug: 'futurefocus' }
    });

    if (!organization) {
      console.error('❌ Organization not found');
      return;
    }

    // Setup centres
    const centreDefinitions = [
      { name: 'Papamoa Beach', code: 'PB1', capacity: 120 },
      { name: 'The Boulevard', code: 'TB1', capacity: 100 },
      { name: 'The Bach', code: 'BC1', capacity: 90 },
      { name: 'Terrace Views', code: 'TV1', capacity: 110 },
      { name: 'Livingstone Drive', code: 'LD1', capacity: 80 },
      { name: 'West Dune', code: 'WD1', capacity: 100 },
    ];

    const centres = new Map();
    for (const centreDef of centreDefinitions) {
      const centre = await prisma.centre.upsert({
        where: { code: centreDef.code },
        update: { name: centreDef.name, capacity: centreDef.capacity },
        create: {
          name: centreDef.name,
          code: centreDef.code,
          organizationId: organization.id,
          capacity: centreDef.capacity,
        }
      });
      centres.set(centreDef.name, centre.id);
    }

    // Import data with proper date handling
    let importedCount = 0;
    const monthCounts = new Map<string, number>();

    for (const row of csvData) {
      try {
        // Better date parsing to avoid timezone issues
        const [year, month] = row.month.split('-');
        // Create date using ISO string to avoid timezone conversion issues
        const dateStr = `${year}-${month}-01T00:00:00.000Z`;
        const date = new Date(dateStr);
        
        const centreId = centres.get(row.centreName);
        if (!centreId) {
          console.warn(`⚠️ Centre not found: ${row.centreName}`);
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
        
        // Count by month
        const monthKey = row.month;
        monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
        
        if (row.month === '2025-06') {
          console.log(`✅ June 2025: ${row.centreName} - ${row.total} total (date: ${dateStr})`);
        }
        
      } catch (error) {
        console.error(`❌ Error importing ${row.centreName} ${row.month}:`, error);
      }
    }

    console.log(`\n🎉 Import completed! ${importedCount} records imported`);
    
    // Show month breakdown
    console.log('\n📅 Records per month:');
    Array.from(monthCounts.entries()).sort().forEach(([month, count]) => {
      console.log(`${month}: ${count} records`);
    });

    // Final verification
    const june2025Check = await prisma.occupancyData.count({
      where: {
        date: {
          gte: new Date('2025-06-01T00:00:00.000Z'),
          lt: new Date('2025-07-01T00:00:00.000Z')
        }
      }
    });
    
    console.log(`\n🎯 June 2025 records in database: ${june2025Check}`);

    const dateRange = await prisma.occupancyData.aggregate({
      _min: { date: true },
      _max: { date: true }
    });
    
    console.log(`📈 Database date range: ${dateRange._min.date} to ${dateRange._max.date}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixedImport();
