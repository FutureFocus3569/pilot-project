import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Papa from "papaparse";

interface CSVRow {
  centreName: string;
  apiId: string;
  month: string;
  u2: string;
  o2: string;
  total: string;
}

// POST /api/import/occupancy - Import occupancy data from CSV
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const csvText = await file.text();
    
    // Parse CSV
    const parseResult = Papa.parse<CSVRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().replace(/\s+/g, '_'),
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: 'CSV parsing failed', details: parseResult.errors },
        { status: 400 }
      );
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each row
    for (const [index, row] of parseResult.data.entries()) {
      try {
        // Find centre by name
        const centre = await prisma.centre.findFirst({
          where: {
            name: {
              contains: row.centreName,
              mode: 'insensitive',
            },
          },
        });

        if (!centre) {
          errors.push(`Row ${index + 1}: Centre '${row.centreName}' not found`);
          errorCount++;
          continue;
        }

        // Parse date (format like "2024-01" to Date)
        const dateParts = row.month.split('-');
        if (dateParts.length !== 2) {
          errors.push(`Row ${index + 1}: Invalid date format '${row.month}'. Expected 'YYYY-MM'`);
          errorCount++;
          continue;
        }

        const year = parseInt(dateParts[0]);
        const monthIndex = parseInt(dateParts[1]) - 1; // Month is 0-indexed in JS

        if (isNaN(year) || isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
          errors.push(`Row ${index + 1}: Invalid date '${row.month}'`);
          errorCount++;
          continue;
        }

        // Create date for first day of the month
        const date = new Date(year, monthIndex, 1);

        // Parse occupancy numbers
        const u2Count = parseInt(row.u2) || 0;
        const o2Count = parseInt(row.o2) || 0;
        const totalOccupancy = parseInt(row.total) || 0;

        // Insert or update occupancy data
        await prisma.occupancyData.upsert({
          where: {
            centreId_date: {
              centreId: centre.id,
              date: date,
            },
          },
          update: {
            u2Count,
            o2Count,
            totalOccupancy,
          },
          create: {
            centreId: centre.id,
            date: date,
            u2Count,
            o2Count,
            totalOccupancy,
          },
        });

        successCount++;
      } catch (error) {
        console.error(`Error processing row ${index + 1}:`, error);
        errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        errorCount++;
      }
    }

    // Log import results (simplified - remove the problematic importLog creation for now)
    console.log('Import completed:', {
      totalRows: parseResult.data.length,
      successCount,
      errorCount,
      errors: errors.slice(0, 5)
    });

    return NextResponse.json({
      message: 'Import completed',
      totalRows: parseResult.data.length,
      successCount,
      errorCount,
      errors: errors.slice(0, 10), // Return first 10 errors
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Import failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
