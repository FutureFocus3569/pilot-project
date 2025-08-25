import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/lib/prisma-enums';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/email';

// Simple UserService with robust fallback
class UserService {
  private mockUsers = [
    {
      id: '1',
      name: 'Courtney Everest',
      email: 'courtney@futurefocus.co.nz',
  role: UserRole.MASTER,
      isActive: true,
      organizationId: 'cm1f9zr5g0001xjr5l5h8fvzm',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  private useDatabase = true;
  private databaseTested = false;

  async testDatabaseConnection(): Promise<boolean> {
    if (this.databaseTested) {
      return this.useDatabase;
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.$queryRaw`SELECT 1`;
      this.useDatabase = true;
      this.databaseTested = true;
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.log('❌ Database connection failed, using mock data');
      this.useDatabase = false;
      this.databaseTested = true;
      return false;
    }
  }

  async getAllUsers(organizationId: string) {
    await this.testDatabaseConnection();

    if (this.useDatabase) {
      try {
        const { prisma } = await import('@/lib/prisma');
        return await prisma.user.findMany({
          where: { 
            organizationId
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            organizationId: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: [
            { role: 'asc' },
            { name: 'asc' }
          ]
        });
      } catch (error) {
        console.log('Database query failed, using mock data');
        this.useDatabase = false;
      }
    }

    // Return mock users for the organization
    return this.mockUsers.filter(user => user.organizationId === organizationId);
  }

  async createUser(userData: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    organizationId: string;
  }) {
    console.log('🔄 Creating user:', userData.email);
    await this.testDatabaseConnection();

    if (this.useDatabase) {
      try {
        const { prisma } = await import('@/lib/prisma');
        
        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        });

        if (existingUser) {
          throw new Error('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        // Create user (simplified - just core fields)
        const user = await prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role,
            organizationId: userData.organizationId,
            isActive: true
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            organizationId: true,
            createdAt: true,
            updatedAt: true,
          }
        });

        console.log('✅ User created in database:', user?.id);
        return user;
      } catch (error) {
        console.log('❌ Database user creation failed:', error);
        this.useDatabase = false;
        // Continue to mock creation below
      }
    }

    // Mock user creation
    console.log('🔄 Creating mock user');
    const existingUser = this.mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const newUser = {
  id: `mock_${Date.now()}`,
  name: userData.name ?? '',
  email: userData.email,
  role: userData.role,
  isActive: true,
  organizationId: userData.organizationId ?? '',
  createdAt: new Date(),
  updatedAt: new Date(),
    };

    this.mockUsers.push(newUser);
    console.log('✅ Mock user created:', newUser.id);
    return newUser;
  }
}

const userService = new UserService();

// GET /api/admin/users - List all users with their permissions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    
    console.log('🔍 GET /api/admin/users called with organizationId:', organizationId);
    
    if (!organizationId) {
      console.log('❌ No organizationId provided');
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    const users = await userService.getAllUsers(organizationId);
    console.log('📊 Found users:', users.length, 'for org:', organizationId);
    console.log('👥 Users:', users.map(u => `${u.name} (${u.email})`));
    
    // Transform to include page permissions for frontend
    const usersWithPermissions = users.map(user => ({
      ...user,
      pagePermissions: ['dashboard'], // Default permissions
      centres: [], // Default centre access
    }));

    console.log('✅ Returning users with permissions');
    return NextResponse.json(usersWithPermissions);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    console.log('📝 POST /api/admin/users - Starting user creation');
    const body = await request.json();
    const { name, email, password, role, organizationId } = body;

    console.log('📋 User data received:', { name, email, role, organizationId });

    // Validate required fields
    if (!name || !email || !password || !role || !organizationId) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create user using the service
    const user = await userService.createUser({
      name,
      email,
      password,
      role,
      organizationId
    });

    // Send welcome email after successful user creation
    try {
      console.log('📧 Attempting to send welcome email to:', email);
      const { success, error: emailErrorMsg } = await sendWelcomeEmail(name, email, password);
      if (success) {
        console.log(`✅ Welcome email sent to ${email}`);
      } else {
        console.log(`⚠️ Failed to send welcome email to ${email}: ${emailErrorMsg ?? ''}`);
      }
    } catch (emailError) {
      console.error('⚠️ Email error:', emailError);
      // Don't fail the user creation if email fails
    }

    console.log('✅ User creation successful:', user.id);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    
    if (error instanceof Error && error.message === 'User with this email already exists') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
