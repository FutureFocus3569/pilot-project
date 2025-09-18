    if ('id' in rawRow) {
      console.log('Row still has id:', rawRow.id);
    }
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const csvPath = path.resolve('/Users/courtneyeverest/Library/CloudStorage/OneDrive-FutureFocusKids/Desktop/centre_occupancy_rows.csv');
  const fileContent = fs.readFileSync(csvPath, 'utf8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  type OccupancyRow = {
    centreId: string;
    month: string;
    u2: string | number;
    o2: string | number;
    total: string | number;
    // id?: string; // Ignore any id from CSV
  };

    for (const rawRow of records as any[]) {
      // Remove any id field from CSV row
      if ('id' in rawRow) {
        console.log('Row still has id:', rawRow.id);
        delete rawRow.id;
      }
      const row = rawRow;
      console.log('Processing row:', row);
    // Debug: log month value and type
  console.log('Row month:', row.month, 'Type:', typeof row.month);
    let parsedMonth: Date | string | null = null;
    if (typeof row.month === 'string') {
      // Convert to ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
      const isoMonth = row.month.replace(' ', 'T') + 'Z';
      parsedMonth = new Date(isoMonth);
      if (isNaN(parsedMonth.getTime())) {
        console.error('Unrecognized month format:', row.month);
        continue;
      }
      // For Prisma/Postgres, use ISO string
      parsedMonth = parsedMonth.toISOString();
    } else {
      console.error('Month is not a string:', row.month);
      continue;
    }
    console.log('Parsed month for DB:', parsedMonth);

    // Find if a record exists for this centreId and month
    const existing = await prisma.centreOccupancy.findFirst({
      where: {
        centreId: row.centreId,
        month: parsedMonth,
      },
    });
    if (existing) {
      console.log('Existing record id:', existing.id);
      await prisma.centreOccupancy.update({
        where: { id: existing.id },
        data: {
          u2: Number(row.u2),
          o2: Number(row.o2),
          total: Number(row.total),
        },
      });
      console.log(`Updated: ${row.centreId} ${row.month}`);
    } else {
      await prisma.centreOccupancy.create({
        data: {
          centreId: row.centreId,
          month: parsedMonth,
          u2: Number(row.u2),
          o2: Number(row.o2),
          total: Number(row.total),
        },
      });
      console.log(`Created: ${row.centreId} ${row.month}`);
    }
  }
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
