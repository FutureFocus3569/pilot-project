// Utility to update all xero_connections with new tokens
export async function updateAllXeroTokens(access_token: string, refresh_token: string) {
  const { error } = await supabaseService
    .from('xero_connections')
    .update({ access_token, refresh_token, updated_at: new Date().toISOString() })
    .neq('tenant_id', null);
  if (error) throw error;
}
import { createClient } from '@supabase/supabase-js';

const supabaseService = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function getAllXeroConnections() {
  const { data, error } = await supabaseService
    .from('xero_connections')
    .select('tenant_id, access_token, tenant_name');

  if (error) throw error;
  return data;
}
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
  constructor() {
    // Debug: Print Supabase env vars at startup
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
    console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY);
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }
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
        // Log and return the actual Supabase error for debugging
        console.error('Supabase insert error:', error);
        throw new Error(`Supabase insert error: ${error.message || error}`);
      }
      if (!data) {
        throw new Error('Supabase insert returned no data.');
      }
      // Success: return the created user
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
      // Handle error, fallback to mock data or rethrow
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  async getAllUsers(centreId: string): Promise<SimpleUser[]> {
    try {
      const supabase = getSupabaseServer();
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('centreId', centreId);

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

// Fetches all authorized Xero tenants using your access token
export async function fetchXeroTenants(accessToken: string) {
  // Helper to try /connections with a given token
  async function tryConnections(token: string) {
    const res = await fetch('https://api.xero.com/connections', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    if (res.status === 401) return { unauthorized: true, res };
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error('Failed to fetch tenants: ' + res.statusText + ' - ' + errBody);
    }
    return { tenants: await res.json() };
  }

  // 1st try with provided access token
  let result = await tryConnections(accessToken);
  if (!result.unauthorized) return result.tenants;

  // If 401, try to refresh token from Supabase
  console.warn('[XERO] Access token expired, attempting refresh from Supabase...');
  // Get refresh token from Supabase (use any tenant row)
  const { data, error } = await supabaseService
    .from('xero_connections')
    .select('refresh_token')
    .limit(1)
    .single();
  if (error || !data?.refresh_token) {
    throw new Error('Access token expired and no refresh token found in Supabase. Please re-authenticate with Xero.');
  }
  // Call local API route to refresh
  const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/xero/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: data.refresh_token }),
  });
  const refreshData = await refreshRes.json();
  if (!refreshRes.ok || !refreshData.access_token) {
    throw new Error('Failed to refresh Xero access token: ' + (refreshData.error || 'Unknown error'));
  }
  // Retry /connections with new token
  result = await tryConnections(refreshData.access_token);
  if (result.unauthorized) {
    throw new Error('Xero access token refresh failed or is still unauthorized. Please re-authenticate with Xero.');
  }
  // Optionally: update Supabase with new access token for all tenants
  await supabaseService
    .from('xero_connections')
    .update({ access_token: refreshData.access_token, refresh_token: refreshData.refresh_token })
    .neq('refresh_token', null);
  return result.tenants;
}

// Fetches P&L for each tenant and returns an array of results
export async function fetchPnlForAllTenants(
  accessToken: string,
  tenants: { tenantId: string; tenantName: string }[],
  fromDate: string,
  toDate: string
) {
  const results = [];
  for (const tenant of tenants) {
    console.log(`[XERO DEBUG] Fetching P&L for tenant: ${tenant.tenantName} (${tenant.tenantId}) from ${fromDate} to ${toDate}`);
    const res = await fetch(
      `https://api.xero.com/api.xro/2.0/Reports/ProfitAndLoss?fromDate=${fromDate}&toDate=${toDate}&periods=11&timeframe=MONTH`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'xero-tenant-id': tenant.tenantId,
          Accept: 'application/json',
        },
      }
    );
    const pnl = await res.json();
    if (!res.ok) {
      console.error(`[XERO ERROR] Failed to fetch P&L for tenant: ${tenant.tenantName} (${tenant.tenantId})`, pnl);
    } else {
      console.log(`[XERO DEBUG] P&L response for ${tenant.tenantName}:`, JSON.stringify(pnl).slice(0, 500));
    }
    results.push({ tenant: tenant.tenantName, tenantId: tenant.tenantId, pnl });
  }
  return results;
}
