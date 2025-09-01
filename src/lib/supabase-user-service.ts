import { getSupabaseServer } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

// Use getSupabaseServer() inside functions instead of top-level client

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'MASTER' | 'ADMIN' | 'USER';
  centreId: string;
}

export interface SimpleUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  centreId: string;
  createdAt: string;
  updatedAt: string;
}

class SupabaseUserService {
  private mockUsers: SimpleUser[] = [
    {
      id: 'user_1',
      name: 'Courtney Everest',
      email: 'courtney@futurefocus.co.nz',
      role: 'MASTER',
      isActive: true,
  centreId: 'centre_futurefocus',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'user_2',
      name: 'Sarah Johnson',
      email: 'sarah@futurefocus.co.nz',
      role: 'ADMIN',
      isActive: true,
  centreId: 'centre_futurefocus',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  async createUser(userData: CreateUserData): Promise<SimpleUser> {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Get supabase client
  const supabase = getSupabaseServer();
  if (!supabase) throw new Error('Supabase not configured');
      // Try to insert into Supabase
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            email: userData.email,
            name: userData.name,
            password: hashedPassword,
            role: userData.role,
            isActive: true,
            centreId: userData.centreId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) {
        console.log('⚠️ Database insert failed, using mock data:', error.message);
        // Fall back to mock data
        const newUser: SimpleUser = {
          id: `user_${Date.now()}`,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          isActive: true,
          centreId: userData.centreId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.mockUsers.push(newUser);
        return newUser;
      }

      console.log('✅ User created in database:', data);
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
        centreId: data.centreId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    } catch (error) {
      console.log('⚠️ Create user error, using mock data:', error);
      // Fall back to mock data
      const newUser: SimpleUser = {
        id: `user_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isActive: true,
        centreId: userData.centreId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.mockUsers.push(newUser);
      return newUser;
    }
  }

  async getAllUsers(organizationId: string): Promise<SimpleUser[]> {
    try {
      // Get supabase client
  const supabase = getSupabaseServer();
  if (!supabase) throw new Error('Supabase not configured');
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('organization_id', organizationId);

      if (error) {
        console.log('⚠️ Database fetch failed, using mock data:', error.message);
  return this.mockUsers.filter(u => u.centreId === centreId);
      }

      console.log('✅ Users fetched from database:', data.length);
  return data.map((user: any) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    centreId: user.centreId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
    } catch (error) {
      console.log('⚠️ Get users error, using mock data:', error);
  return this.mockUsers.filter(u => u.centreId === centreId);
    }
  }

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
  const supabase = getSupabaseServer();
  if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error) {
        return {
          connected: false,
          message: `Database connection failed: ${error.message}`
        };
      }

      return {
        connected: true,
        message: 'Database connection successful'
      };
    } catch (error) {
      return {
        connected: false,
        message: `Database connection error: ${error}`
      };
    }
  }

  isUsingDatabase(): boolean {
    // We'll update this based on connection test results
    return false; // Start with false, will be updated after testing
  }
}

export const supabaseUserService = new SupabaseUserService();
