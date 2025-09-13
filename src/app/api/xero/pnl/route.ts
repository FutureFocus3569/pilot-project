
import { NextRequest, NextResponse } from 'next/server';
import { fetchPnLForAllCompanies } from '@/lib/xero-batch-pnl';


export async function POST(req: NextRequest) {
  const body = await req.json();

  // Always fetch the full year for multi-month reporting
  const { year, trackingCategoryId, accessToken } = body;
  const fromDate = `${year}-01-01`;
  const toDate = `${year}-12-31`;

  // Token priority: body, env
  let tokenSource = 'none';
  let token = accessToken;
  if (token) {
    tokenSource = 'body';
  } else if (process.env.XERO_ACCESS_TOKEN) {
    token = process.env.XERO_ACCESS_TOKEN;
    tokenSource = 'env';
  }
  if (!token) {
    console.error('No Xero access token provided.');
    return NextResponse.json({ error: 'Missing Xero access token.' }, { status: 400 });
  }
  console.log(`Using Xero access token from: ${tokenSource}`);

  try {
    const results = await fetchPnLForAllCompanies({ fromDate, toDate, trackingCategoryId, accessToken: token });
    return NextResponse.json(results);
  } catch (err: any) {
    // Log and return full error
    console.error('Xero P&L API error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error', details: err }, { status: 500 });
  }
}
