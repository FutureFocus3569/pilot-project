import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: authUser.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has admin access
    const hasAdminAccess = user.role === 'MASTER' || user.role === 'ADMIN';
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // For now, return a predefined list of budget categories
    // In production, these would come from a database table
    const defaultCategories = [
      { id: 'art-messy-play', name: 'Art and Messy Play', description: 'Art supplies, craft materials, messy play items' },
      { id: 'centre-purchases', name: 'Centre Purchases', description: 'General centre equipment and supplies' },
      { id: 'cleaning-supplies', name: 'Cleaning Supplies', description: 'Cleaning products and equipment' },
      { id: 'food-costs', name: 'Food Costs', description: 'Food and beverage purchases' },
      { id: 'nappies-wipes', name: 'Nappies and Wipes', description: 'Nappies, wipes, and hygiene supplies' },
      { id: 'educational-resources', name: 'Educational Resources', description: 'Books, educational toys, learning materials' },
      { id: 'maintenance-repairs', name: 'Maintenance & Repairs', description: 'Building and equipment maintenance' },
      { id: 'staff-expenses', name: 'Staff Expenses', description: 'Staff-related purchases and expenses' },
      { id: 'outdoor-equipment', name: 'Outdoor Equipment', description: 'Playground equipment, outdoor toys, sports gear' },
      { id: 'technology', name: 'Technology', description: 'Computers, tablets, software, tech equipment' },
    ];

    return NextResponse.json(defaultCategories);

  } catch (error) {
    console.error('Budget categories API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: authUser.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has admin access
    const hasAdminAccess = user.role === 'MASTER' || user.role === 'ADMIN';
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    // Create category ID from name
    const categoryId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const newCategory = {
      id: categoryId,
      name: name.trim(),
      description: description?.trim() || undefined
    };

    // In production, this would save to database
    // For now, we'll just return the created category
    return NextResponse.json(newCategory, { status: 201 });

  } catch (error) {
    console.error('Create budget category API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
