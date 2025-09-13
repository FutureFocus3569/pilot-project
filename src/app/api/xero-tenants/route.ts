import { NextRequest, NextResponse } from 'next/server';
import { fetchXeroTenants, getAllXeroConnections } from '@/lib/supabase-user-service';

// TEMPORARY: Hardcoded fallback access token (replace with your real token or use query param)
const HARDCODED_ACCESS_TOKEN = process.env.XERO_ACCESS_TOKEN || '';

export async function GET(req: NextRequest) {
  try {
    // Try to get token from query param, else fallback to hardcoded
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('access_token') || HARDCODED_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'No access token provided.' }, { status: 400 });
    }
    const tenants = await fetchXeroTenants(token);
    // Return only tenantName and tenantId for clarity
    const result = tenants.map((t: any) => ({ tenantName: t.tenantName, tenantId: t.tenantId }));
    return NextResponse.json({ tenants: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
