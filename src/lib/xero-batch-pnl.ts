
import { fetchXeroTenants, fetchPnlForAllTenants } from './supabase-user-service';


// This version fetches the access token from env or Supabase, gets live tenants, and fetches P&L for each
export async function fetchPnLForAllCompanies({ fromDate, toDate, trackingCategoryId, accessToken }: {
  fromDate: string;
  toDate: string;
  trackingCategoryId?: string;
  accessToken?: string;
}) {
  // Use accessToken from param, env, or fallback to Supabase (if needed)
  const token = accessToken || process.env.XERO_ACCESS_TOKEN;
  if (!token) throw new Error('No Xero access token provided.');

  // Get live tenant list from Xero
  const tenants = await fetchXeroTenants(token);
  // Map to expected format for fetchPnlForAllTenants
  const mappedTenants = tenants.map((t: any) => ({ tenantId: t.tenantId, tenantName: t.tenantName }));

  // Fetch P&L for all tenants
  return fetchPnlForAllTenants(token, mappedTenants, fromDate, toDate);
}
