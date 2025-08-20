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

async function importOccupancyData() {
  try {
    console.log('🚀 Starting occupancy data import...');

    // Read CSV file
    const csvPath = path.join(process.cwd(), 'occupancy-data.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ CSV file not found at:', csvPath);
      console.log('Please save your CSV file as "occupancy-data.csv" in the project root folder.');
      return;
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    console.log('📄 CSV Headers found:', headers);
    
    // Parse CSV data
    const csvData: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 5) {
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

    // Get organization
    const organization = await prisma.organization.findFirst({
      where: { slug: 'futurefocus' }
    });

    if (!organization) {
      console.error('❌ Organization not found. Please run setup first.');
      return;
    }

    // Create/update centres
    const centreNames = [...new Set(csvData.map(row => row.centreName))];
    console.log('🏢 Centres found:', centreNames);

    const centres = new Map();
    for (const centreName of centreNames) {
      // Create a centre code from the name
      const code = centreName.replace(/\s+/g, '').toUpperCase().substring(0, 10);
      
      const centre = await prisma.centre.upsert({
        where: { code },
        update: { name: centreName },
        create: {
          name: centreName,
          code,
          organizationId: organization.id,
          capacity: 100, // Default capacity - you can update this later
        }
      });
      
      centres.set(centreName, centre.id);
      console.log(`✅ Centre ready: ${centreName} (${code})`);
    }

    // Import occupancy data
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

        await prisma.occupancyData.upsert({
          where: {
            centreId_date: {
              centreId,
              date
            }
          },
          update: {
            u2Count: row.u2,
            o2Count: row.o2,
            totalCount: row.total,
            updatedAt: new Date()
          },
          create: {
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

    console.log('🎉 Import completed!');
    console.log(`✅ Imported: ${importedCount} records`);
    console.log(`⚠️ Skipped: ${skippedCount} records`);
    console.log('');
    console.log('Your dashboard now has real historical data!');
    console.log('Refresh your browser to see the updated charts and percentages.');

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importOccupancyData();
