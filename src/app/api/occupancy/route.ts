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
    try {
      const occupancyData = await prisma.occupancyData.findMany({
        where,
        include: {
          centre: {
            select: {
              name: true,
              code: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        take: limit ? parseInt(limit) : undefined,
      });
      console.log('Occupancy API Result:', occupancyData);
      return NextResponse.json(occupancyData);
    } catch (queryError) {
      console.error('Occupancy API Query Error:', queryError);
      throw queryError;
    }
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
