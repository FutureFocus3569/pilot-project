import bcrypt from 'bcryptjs';

// Mock users for development (fallback when DB is not accessible)
const mockUsers = [
  {
    id: '1',
    name: 'Courtney Everest',
    email: 'courtney@futurefocus.co.nz',
    password: '$2b$12$hWOmmQlTAY/oyWhGJVxf3emW35PWuTOXWLEIDHxKVVMxmrux0I0FK', // 1234
    role: 'MASTER' as const,
    isActive: true,
    organizationId: 'org_1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'MASTER' | 'ADMIN' | 'USER';
  isActive: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'MASTER' | 'ADMIN' | 'USER';
  organizationId: string;
  centreIds?: string[];
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'MASTER' | 'ADMIN' | 'USER';
  isActive?: boolean;
  centreIds?: string[];
}

class UserService {
  private users: User[] = [...mockUsers];
  private useDatabase = true; // Enable database now that it's working
  private databaseTested = false;

  async testDatabaseConnection(): Promise<boolean> {
    if (this.databaseTested) {
      return this.useDatabase;
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      // Simple test query
      await prisma.$queryRaw`SELECT 1`;
      this.useDatabase = true;
      this.databaseTested = true;
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.log('❌ Database connection failed:', error);
      this.useDatabase = false;
      this.databaseTested = true;
      return false;
    }
  }

  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    // Test database connection if not already tested
    await this.testDatabaseConnection();

    if (this.useDatabase) {
      try {
        const { prisma } = await import('@/lib/prisma');
        const users = await prisma.user.findMany({
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
        });
  // Ensure name is never null
  return users.map(u => ({ ...u, name: u.name || '' }));
      } catch (error) {
        console.log('Database not available, using mock data');
        this.useDatabase = false;
      }
    }

    return this.users.map(({ password, ...user }) => user);
  }

  async getUserById(id: string): Promise<User | null> {
    if (this.useDatabase) {
      try {
        const { prisma } = await import('@/lib/prisma');
  const user = await prisma.user.findUnique({ where: { id } });
  if (user) user.name = user.name ?? '';
  if (user && user.name == null) user.name = '';
  return user as User;
      } catch (error) {
        console.log('Database not available, using mock data');
        this.useDatabase = false;
      }
    }

    return this.users.find(user => user.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (this.useDatabase) {
      try {
        const { prisma } = await import('@/lib/prisma');
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) user.name = user.name ?? '';
  if (user && user.name == null) user.name = '';
  return user as User;
      } catch (error) {
        console.log('Database not available, using mock data');
        this.useDatabase = false;
      }
    }

    return this.users.find(user => user.email === email) || null;
  }

  async createUser(data: CreateUserData): Promise<Omit<User, 'password'>> {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      isActive: true,
      organizationId: data.organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (this.useDatabase) {
      try {
        const { prisma } = await import('@/lib/prisma');
        const user = await prisma.user.create({
          data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: data.role,
            organizationId: data.organizationId,
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
        });

        // Handle centre permissions if provided
        if (data.centreIds && data.centreIds.length > 0) {
          await prisma.userCentrePermission.createMany({
            data: data.centreIds.map((centreId: string) => ({
              userId: user.id,
              centreId,
              canViewOccupancy: true,
              canEditOccupancy: data.role === 'ADMIN' || data.role === 'MASTER',
              canViewFinancials: data.role === 'ADMIN' || data.role === 'MASTER',
              canEditFinancials: data.role === 'MASTER',
              canViewEnrollments: true,
              canEditEnrollments: data.role === 'ADMIN' || data.role === 'MASTER',
              canViewReports: true,
              canManageStaff: data.role === 'MASTER',
            })),
          });
        }

  user.name = user.name ?? '';
  if (user.name == null) user.name = '';
  return user as Omit<User, 'password'>;
      } catch (error) {
        console.log('Database not available, using mock data');
        this.useDatabase = false;
      }
    }

    // Mock implementation
    this.users.push(newUser);
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async updateUser(id: string, data: UpdateUserData): Promise<Omit<User, 'password'> | null> {
    if (this.useDatabase) {
      try {
        const { prisma } = await import('@/lib/prisma');
        const user = await prisma.user.update({
          where: { id },
          data: {
            ...data,
            updatedAt: new Date(),
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
        });
  user.name = user.name || '';
  if (user.name == null) user.name = '';
  return user;
      } catch (error) {
        console.log('Database not available, using mock data');
        this.useDatabase = false;
      }
    }

    // Mock implementation
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...data,
      updatedAt: new Date(),
    };

    const { password, ...userWithoutPassword } = this.users[userIndex];
    return userWithoutPassword;
  }

  async deleteUser(id: string): Promise<boolean> {
    if (this.useDatabase) {
      try {
        const { prisma } = await import('@/lib/prisma');
        await prisma.user.delete({ where: { id } });
        return true;
      } catch (error) {
        console.log('Database not available, using mock data');
        this.useDatabase = false;
      }
    }

    // Mock implementation
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;

    this.users.splice(userIndex, 1);
    return true;
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.isActive) return null;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Enable database mode when it becomes available
  enableDatabase() {
    this.useDatabase = true;
  }

  // Check if we're using the database
  isUsingDatabase() {
    return this.useDatabase;
  }
}

export const userService = new UserService();
