// Define XeroToken type
export type XeroToken = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
};
// scripts/xero-refresh-and-sync.ts
// Example Node.js script to refresh Xero token and run your nightly sync

import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

// Load Supabase credentials from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase credentials in environment variables.');
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Fetch all Xero connections from Supabase
async function loadConnections() {
  const { data, error } = await supabase.from('xero_connections').select('*');
  if (error) {
    throw new Error('Failed to fetch xero_connections: ' + error.message);
  }
  return data;
}

// Update tokens for a company in Supabase
async function updateTokensForCompany(id: string, access_token: string, refresh_token: string) {
  const { error } = await supabase
    .from('xero_connections')
    .update({ access_token, refresh_token })
    .eq('id', id);
  if (error) {
    throw new Error('Failed to update tokens in Supabase: ' + error.message);
  }
}

async function refreshXeroToken(refreshToken: string): Promise<XeroToken> {
  console.log('[XERO DEBUG] Refreshing Xero token with refresh_token:', refreshToken);
  // Replace with your Xero client credentials
  const XERO_CLIENT_ID = process.env.XERO_CLIENT_ID;
  const XERO_CLIENT_SECRET = process.env.XERO_CLIENT_SECRET;
  if (!XERO_CLIENT_ID || !XERO_CLIENT_SECRET) {
    throw new Error('Missing Xero client credentials in environment variables.');
  }
  const res = await fetch('https://identity.xero.com/connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  const tokenData = await res.json();
  if (!res.ok) {
    console.error('[XERO DEBUG] Failed to refresh Xero token. Response:', tokenData);
    throw new Error('Failed to refresh Xero token: ' + JSON.stringify(tokenData));
  }
  console.log('[XERO DEBUG] Refresh token response:', tokenData);
  // Type guard to ensure tokenData is XeroToken
  if (!tokenData || typeof tokenData !== 'object' || !('access_token' in tokenData) || !('refresh_token' in tokenData)) {
    throw new Error('refreshXeroToken: Response is not a valid XeroToken');
  }
  return tokenData as XeroToken;
}

async function runNightlySync() {
  try {
    // 1. Load all Xero connections from Supabase
    const companies = await loadConnections();
    if (!companies || companies.length === 0) {
      throw new Error('No Xero connections found in Supabase.');
    }
    for (const company of companies) {
      try {
        // 2. Refresh access token for each company
        const refreshed = await refreshXeroToken(company.refresh_token);
        // 3. Update tokens in Supabase
        await updateTokensForCompany(company.id, refreshed.access_token, refreshed.refresh_token);
        console.log(`✅ Refreshed Xero token for ${company.company_name}`);
        // 4. Sync data for this company
        const syncResult = await syncXeroData(refreshed.access_token, company.tenant_id);
        console.log(`[XERO DEBUG] Synced data for tenant: ${company.tenant_id}`);
        console.log(`[XERO DEBUG] Xero API sync result for tenant ${company.tenant_id}:`, JSON.stringify(syncResult, null, 2));
      } catch (err) {
        console.error(`[XERO DEBUG] ❌ Sync failed for company: ${company.company_name}`, err);
      }
    }
  } catch (err) {
    console.error('[XERO DEBUG] Nightly sync failed:', err);
    process.exit(1);
  }
}

// Placeholder for your actual Xero sync logic
async function syncXeroData(accessToken: string, tenantId: string) {
  console.log(`[XERO DEBUG] Starting sync for tenant: ${tenantId}`);
  const res = await fetch('https://api.xero.com/api.xro/2.0/Reports/ProfitAndLoss', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Xero-tenant-id': tenantId,
      'Accept': 'application/json',
    },
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`[XERO DEBUG] Xero API error for tenant ${tenantId}: ${res.status} ${text}`);
    throw new Error(`Xero API error: ${res.status} ${text}`);
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error(`[XERO DEBUG] JSON parse error for tenant ${tenantId}:`, err);
    throw err;
  }
  return data;
}

runNightlySync();
