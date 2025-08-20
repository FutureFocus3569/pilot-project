import { NextRequest, NextResponse } from 'next/server';

// List of Papamoa Beach account codes and categories
const PAPAMOA_ACCOUNT_CODES = [
  { category: 'Art and Messy Play', code: '2eb4698c-8893-453f-a115-cad86193fd17' },
  { category: 'Food Costs', code: '3d27ac13-9eba-4030-8c4d-1a488f63fa44' },
  { category: 'Cleaning Supplies', code: '0e5613e1-74ef-4d6b-8ab2-bf1c1ce143bf' },
  { category: 'Nappies and Wipes', code: 'e8ab72c1-53ff-4bcd-810e-2da724231d3e' },
  { category: 'Centre Purchases', code: 'a04ca46e-9500-4bed-a0e7-ae5008c3571b' },
  { category: 'Kiri Room Resources', code: 'd54b966a-b3a0-4058-9c02-d96380f7ae8c' },
  { category: 'Wai Room Resources', code: 'bc41bc72-1cc8-4e3e-9dd7-69543c88671a' },
  { category: 'Nga Room Resources', code: '079bf6de-fecf-41dd-b042-943fff152c14' },
  { category: 'Stationary and Office Expenses', code: 'b75f52c7-02f6-4e1a-b454-50644b58e7ab' },
  { category: 'Meeting Costs', code: 'fb893101-d855-41a1-b268-4fc509836367' },
  { category: 'Staff Welfare', code: '22dcf5d3-9e98-46cc-9261-5de90b9c07fb' },
  { category: 'Repairs and Maintenance', code: '48e161f1-e67e-493e-a41f-2c46ead2ea73' },
];

const XERO_CLIENT_ID = process.env.XERO_CLIENT_ID!;
const XERO_CLIENT_SECRET = process.env.XERO_CLIENT_SECRET!;
const XERO_REDIRECT_URI = process.env.XERO_REDIRECT_URI!;




export async function POST(req: NextRequest) {
  const { accessToken, year, tenantId } = await req.json();
  if (!accessToken) {
    return NextResponse.json({ error: 'Missing Xero access token' }, { status: 400 });
  }
  if (!tenantId) {
    return NextResponse.json({ error: 'Missing Xero tenantId' }, { status: 400 });
  }


  // Fetch actuals for each account code, for each month
  const results: any = {};
  // Helper to get last day of month
  function getLastDayOfMonth(year: number, month: number) {
    return new Date(year, month, 0).getDate();
  }

  for (const { category, code } of PAPAMOA_ACCOUNT_CODES) {
    results[category] = {};
    for (let month = 1; month <= 12; month++) {
      const fromDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = getLastDayOfMonth(year, month);
      const toDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
      // Xero API: GET /reports/ProfitAndLoss
  const url = `https://api.xero.com/api.xro/2.0/Reports/ProfitAndLoss?fromDate=${fromDate}&toDate=${toDate}&accountCodes=${code}`;
      let data = null;
      let amount = 0;
      try {
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'xero-tenant-id': tenantId,
          },
        });
        const text = await res.text();
  // Debug: log the raw Xero API response before parsing
  console.error('Xero API raw response:', text);
        try {
          data = JSON.parse(text);
        } catch (jsonErr) {
          console.error('Failed to parse Xero response as JSON:', {
            url,
            status: res.status,
            statusText: res.statusText,
            responseText: text,
            category,
            code,
            fromDate,
            toDate,
            error: jsonErr
          });
          results[category][fromDate] = 0;
          continue;
        }
        // Debug: log the raw Xero response for this account/month
        console.log(`Xero P&L for code ${code} (${category}) from ${fromDate} to ${toDate}:`, JSON.stringify(data));
        // Parse the report to get the actual spend for this account code
        const rows = data.Reports?.[0]?.Rows || [];
        for (const row of rows) {
          if (row.RowType === 'Section') {
            for (const subRow of row.Rows || []) {
              if (
                subRow.Cells &&
                subRow.Cells[0]?.Attributes?.some(
                  (attr: any) => attr.Id === 'account' && attr.Value === code
                )
              ) {
                // Xero P&L: Cells[1] = This Period, Cells[2] = YTD (for single month period)
                amount = parseFloat(subRow.Cells[1]?.Value || '0');
                console.log(`Parsed THIS PERIOD amount for code ${code} (${category}) in ${fromDate}:`, amount);
              }
            }
          }
        }
      } catch (e) {
        console.error('Error fetching/parsing Xero report:', e);
        amount = 0;
      }
      results[category][fromDate] = amount;
    }
  }
  return NextResponse.json({ results });
}
