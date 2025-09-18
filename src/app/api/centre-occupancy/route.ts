import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/centre-occupancy - Get centre occupancy data with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthString = searchParams.get('month');
    if (!monthString || typeof monthString !== 'string') {
      console.error('API error: Invalid or missing "month" query param', { monthString });
      return NextResponse.json({ error: 'Invalid or missing "month" query param' }, { status: 400 });
    }
    // Always use first day of selected month
    const selectedDate = new Date(monthString);
    if (isNaN(selectedDate.getTime())) {
      console.error('API error: Invalid date format', { monthString });
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }
    // Set fromDate to first day of selected month
    const fromDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-01`;
    // Set toDate to first day of next month
    const toDate = `${selectedDate.getMonth() === 11 ? selectedDate.getFullYear() + 1 : selectedDate.getFullYear()}-${String(selectedDate.getMonth() === 11 ? 1 : selectedDate.getMonth() + 2).padStart(2, '0')}-01`;
    console.log('Centre Occupancy API query params:', { fromDate, toDate });
    let occupancyData: any[] = [];
    try {
      occupancyData = await prisma.$queryRawUnsafe(
        `SELECT id, "centreId", "month", "u2", "o2", "total"
         FROM "centre_occupancy"
         WHERE "month" >= $1::timestamp AND "month" < $2::timestamp
         ORDER BY "month" DESC`,
        fromDate,
        toDate
      );
      console.log("Centre Occupancy API SQL result for", { fromDate, toDate }, ":", JSON.stringify(occupancyData, null, 2));
    } catch (sqlError) {
      console.error('Supabase query failed:', sqlError);
      return NextResponse.json({ error: 'Database query failed', details: String(sqlError) }, { status: 500 });
    }
    return NextResponse.json(occupancyData || []);
  } catch (error) {
    console.error('Error fetching centre occupancy data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch centre occupancy data', details: String(error) },
      { status: 500 }
    );
  }
}
