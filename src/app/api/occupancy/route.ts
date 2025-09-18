import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/occupancy - Get occupancy data with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const centreId = searchParams.get('centreId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');

    const where: Record<string, any> = {};
    if (centreId) {
      where.centreId = centreId;
    }
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    console.log('Occupancy API Query:', { where, limit });
    // Query occupancyData table for enrolment status
    const occData = await prisma.occupancyData.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    // Map fields for frontend
    const mapped = occData.map(row => ({
      id: row.id,
      centreId: row.centreId,
      date: row.date,
      currentChildren: row.currentChildren,
      futureChildren: row.futureChildren,
      waitingChildren: row.waitingChildren,
      enquiryChildren: row.enquiryChildren,
    }));
    console.log('Occupancy API Result:', mapped);
    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Error fetching occupancy data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch occupancy data', details: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/occupancy - Create occupancy record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
  const { centreId, date, u2Count, o2Count, totalCount } = body;

    const occupancyData = await prisma.occupancyData.upsert({
      where: {
        centreId_date: {
          centreId,
          date: new Date(date),
        },
      },
      update: {
        u2Count,
        o2Count,
        totalCount,
      },
      create: {
        centreId,
        date: new Date(date),
        u2Count,
        o2Count,
        totalCount,
      },
      include: {
        centre: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    return NextResponse.json(occupancyData, { status: 201 });
  } catch (error) {
    console.error('Error creating occupancy data:', error);
    return NextResponse.json(
      { error: 'Failed to create occupancy data' },
      { status: 500 }
    );
  }
}
