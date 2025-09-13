
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// You should set these in your .env.local file for security
const XERO_CLIENT_ID = process.env.XERO_CLIENT_ID!;
const XERO_CLIENT_SECRET = process.env.XERO_CLIENT_SECRET!;
const XERO_REDIRECT_URI = process.env.XERO_REDIRECT_URI!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(req: NextRequest) {
  console.log('Xero callback route hit');
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code) {
    return NextResponse.json({ error: 'Missing code from Xero' }, { status: 400 });
  }


  // Exchange code for access token
  const tokenRes = await fetch('https://identity.xero.com/connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: XERO_REDIRECT_URI,
    }),
  });

  const tokenData = await tokenRes.json();
  // Always log the full token response for debugging
  console.log('[XERO CALLBACK] FULL tokenData:', JSON.stringify(tokenData, null, 2));
  // Always log both tokens, even if missing
  console.log('[XERO CALLBACK] access_token:', tokenData.access_token || '[NOT RETURNED]');
  console.log('[XERO CALLBACK] refresh_token:', tokenData.refresh_token || '[NOT RETURNED]');
  if (!tokenData.refresh_token) {
    console.error('[XERO CALLBACK] No refresh_token returned! This is required for automation.');
  }
  // Store tokens in Supabase xero_connections table
  try {
    // Use service role key for secure server-side access
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Step 1: Fetch tenant_id from Xero connections API
    if (tokenData.access_token) {
      const connectionsRes = await fetch('https://api.xero.com/connections', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/json',
        },
      });
      const connections = await connectionsRes.json();
      console.log('[XERO CALLBACK] Xero connections:', JSON.stringify(connections, null, 2));
      if (Array.isArray(connections) && connections.length > 0) {
        // Upsert all tenants
        const upserts = connections.map((conn: any) => ({
          tenant_id: conn.tenantId,
          tenant_name: conn.tenantName,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + (tokenData.expires_in || 0) * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }));
        const { error: upsertError } = await supabaseAdmin
          .from('xero_connections')
          .upsert(upserts, { onConflict: 'tenant_id' });
        if (upsertError) {
          throw upsertError;
        }
        console.log(`[XERO CALLBACK] Tokens upserted in Supabase for all tenants.`);
      } else {
        throw new Error('No tenants found from Xero connections API.');
      }
    }
  } catch (err) {
    console.error('[XERO CALLBACK] Failed to update tokens in Supabase:', err);
  }

  if (!tokenRes.ok) {
    return NextResponse.json({ error: 'Failed to get Xero token', details: tokenData }, { status: 400 });
  }

  // Redirect to dashboard Xero page with access token in URL (for local dev)
  const accessToken = tokenData.access_token;
  if (accessToken) {
    // Use absolute URL for redirect
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    const redirectUrl = `${baseUrl}/xero?access_token=${encodeURIComponent(accessToken)}`;
    return NextResponse.redirect(redirectUrl);
  }
  // If no token, show error
  return NextResponse.json({ error: 'Failed to get Xero token', details: tokenData }, { status: 400 });
}
