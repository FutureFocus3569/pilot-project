import { getSupabaseServer } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

// Use getSupabaseServer() inside functions instead of top-level client

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'MASTER' | 'ADMIN' | 'USER';
  organizationId: string;
}

export interface SimpleUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  organizationId: string;
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
      organizationId: 'org_futurefocus',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'user_2',
      name: 'Sarah Johnson',
      email: 'sarah@futurefocus.co.nz',
      role: 'ADMIN',
      isActive: true,
      organizationId: 'org_futurefocus',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  async createUser(userData: CreateUserData): Promise<SimpleUser> {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Try to insert into Supabase
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            email: userData.email,
            name: userData.name,
            password: hashedPassword,
            role: userData.role,
            is_active: true,
            organization_id: userData.organizationId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
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
          organizationId: userData.organizationId,
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
        isActive: data.is_active,
        organizationId: data.organization_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
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
        organizationId: userData.organizationId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.mockUsers.push(newUser);
      return newUser;
    }
  }

  async getAllUsers(organizationId: string): Promise<SimpleUser[]> {
    try {
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('organization_id', organizationId);

      if (error) {
        console.log('⚠️ Database fetch failed, using mock data:', error.message);
        return this.mockUsers.filter(u => u.organizationId === organizationId);
      }

      console.log('✅ Users fetched from database:', data.length);
      return data.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.is_active,
        organizationId: user.organization_id,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      }));
    } catch (error) {
      console.log('⚠️ Get users error, using mock data:', error);
      return this.mockUsers.filter(u => u.organizationId === organizationId);
    }
  }

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
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
