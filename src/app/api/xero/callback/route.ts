
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// You should set these in your .env.local file for security
const XERO_CLIENT_ID = process.env.XERO_CLIENT_ID!;
const XERO_CLIENT_SECRET = process.env.XERO_CLIENT_SECRET!;
const XERO_REDIRECT_URI = process.env.XERO_REDIRECT_URI!;

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
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // You may want to identify the correct row by tenant_id or company_name
    // For now, we assume tenant_id is available in tokenData or state
    let tenant_id = tokenData.tenant_id;
    if (!tenant_id && state) {
      // Optionally, parse tenant_id from state if you encoded it there
      try {
        const stateObj = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
        tenant_id = stateObj.tenant_id;
      } catch {}
    }
    if (!tenant_id) {
      // Fallback: fetch connections and update the first one (not recommended for prod)
      const { data: connections, error: fetchError } = await supabase
        .from('xero_connections')
        .select('*')
        .limit(1);
      if (connections && connections.length > 0) {
        tenant_id = connections[0].tenant_id;
      }
    }
    if (!tenant_id) {
      throw new Error('No tenant_id found to update tokens in Supabase.');
    }
    const { error: updateError } = await supabase
      .from('xero_connections')
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        updated_at: new Date().toISOString(),
      })
      .eq('tenant_id', tenant_id);
    if (updateError) {
      throw updateError;
    }
    console.log(`[XERO CALLBACK] Tokens updated in Supabase for tenant_id: ${tenant_id}`);
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
