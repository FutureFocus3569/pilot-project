import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Mock centres data for development - Updated with correct centre names
const mockCentres = [
  {
    id: 'papamoa-beach',
    name: 'Papamoa Beach',
    code: 'CC1',
    address: '123 Papamoa Beach Road, Papamoa',
    capacity: 50
  },
  {
    id: 'the-boulevard',
    name: 'The Boulevard',
    code: 'CC2',
    address: '456 The Boulevard, Mount Maunganui',
    capacity: 40
  },
  {
    id: 'the-bach',
    name: 'The Bach',
    code: 'CC3',
    address: '789 Bach Avenue, Tauranga',
    capacity: 60
  },
  {
    id: 'terrace-views',
    name: 'Terrace Views',
    code: 'CC4',
    address: '321 Terrace Road, Tauranga',
    capacity: 35
  },
  {
    id: 'livingstone-drive',
    name: 'Livingstone Drive',
    code: 'CC5',
    address: '654 Livingstone Drive, Tauranga',
    capacity: 45
  },
  {
    id: 'west-dune',
    name: 'West Dune',
    code: 'CC6',
    address: '987 West Dune Road, Tauranga',
    capacity: 30
  }
];

// GET /api/centres - Get all centres
export async function GET() {
  try {
    // Try database first
    try {
      const centres = await prisma.centre.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          address: true,
          capacity: true,
          overdueInvoicesAmount: true,
          discoverApiId: true,
        },
        orderBy: { name: 'asc' }
      });
      if (centres.length > 0) {
        console.log('✅ Centres fetched from database:', centres.length);
        return NextResponse.json(centres);
      }
    } catch (error) {
      console.log('❌ Database centres fetch failed, using mock data');
    }

    // Fallback to mock data
    console.log('🔄 Using mock centres data');
    return NextResponse.json(mockCentres);
  } catch (error) {
    console.error('Error fetching centres:', error);
    return NextResponse.json({ error: 'Failed to fetch centres' }, { status: 500 });
  }
}

// POST /api/centres - Create a new centre
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, address, phone, capacity, organizationId } = body;

    const centre = await prisma.centre.create({
      data: {
        name,
        code,
        address,
        phone,
        capacity,
        organizationId,
      },
    });

    return NextResponse.json(centre, { status: 201 });
  } catch (error) {
    console.error('Error creating centre:', error);
    return NextResponse.json(
      { error: 'Failed to create centre' },
      { status: 500 }
    );
  }
}
