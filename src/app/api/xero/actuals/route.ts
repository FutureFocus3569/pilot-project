// ...existing code...
// GUID mapping for The Bach (tenantId: '63251a82-8296-433a-92ed-faf696756545')
const BACH_GUIDS: { [category: string]: string } = {
  'Art and Messy Play': '640b5ea2-dfc6-4316-a416-1b990a9140ea',
  'Food Costs': '472b0c4b-9327-4190-9df7-f79c9944526e',
  'Cleaning Supplies': '99eb32f2-23b7-4aa6-a838-132db55e75e8',
  'Nappies and Wipes': '2fe4c54d-0dbe-45e9-8a4d-eb2f16ad36f8',
  'Centre Purchases': 'a5997203-cf02-4eed-87e0-d466028ad449',
  'Kiri Room Resources': 'b38a14d8-bdc4-468b-99f9-8c2a2645e6c5',
  'Nga Room Resources': '750a945e-218b-4cac-916a-a4ff79e174d7',
  'Stationary and Office Expenses': '654be79a-c3f4-4e79-b6d5-8fefde2f076f',
  'Meeting Costs': 'cc116345-4472-4c5b-8e74-bdfc2751b780',
  'Staff Welfare': '305687df-c186-47ff-aeac-64ed1e0096a3',
  'Repairs and Maintenance': 'da343eb9-a815-48b1-91b2-5d9d17b2b00f',
};

import { NextRequest, NextResponse } from 'next/server';

// --- Helpers ---
const parseMoney = (s?: string) =>
  s ? parseFloat(String(s).replace(/[^0-9.-]/g, '')) || 0 : 0;

const toIsoFromLabel = (label: string) => {
  // "31 Aug 25" -> "2025-08-31"
  const [d, mon, yy] = label.split(' ');
  const m = {Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12}[mon as keyof any];
  const year = 2000 + parseInt(yy, 10);
  return `${year}-${String(m).padStart(2,'0')}-${String(parseInt(d,10)).padStart(2,'0')}`;
};

function flattenRows(rows: any[] = []): any[] {
  const out: any[] = [];
  for (const r of rows) {
    if (r.RowType === 'Section' && Array.isArray(r.Rows)) {
      out.push(...flattenRows(r.Rows));
    } else {
      out.push(r);
    }
  }
  return out;
}

function extractMonthlyByAccountId(report: any, accountId: string) {
  // 1) get month labels from header row
  const header = report?.Rows?.find((r: any) => r.RowType === 'Header');
  const monthLabels: string[] = (header?.Cells ?? []).slice(1).map((c: any) => c.Value); // skip first blank cell

  // 2) find the account row anywhere in the report
  const flat = flattenRows(report?.Rows);
  const row = flat.find((r: any) =>
    r.RowType === 'Row' &&
    r.Cells?.[0]?.Attributes?.some((a: any) => a.Id === 'account' && a.Value === accountId)
  );

  // 3) map to all months (zero-fill if missing)
  const values = row ? row.Cells.slice(1).map((c: any) => parseMoney(c.Value)) : [];
  return monthLabels.map((label, i) => ({
    label,
    periodEnd: toIsoFromLabel(label),
    amount: values[i] ?? 0,
  }));
}

// --- Main logic factored for GET/POST ---
async function fetchActuals({ accessToken, year, tenantId, categoryAccountCodes }: any) {
  // ...existing code to set up effectiveCategoryCodes, fetch P&L, etc...
  // Copy from your POST handler up to the point where you have the P&L report as a JS object

  // (Copy your effectiveCategoryCodes logic here)
  let effectiveCategoryCodes = { ...categoryAccountCodes };
  if (tenantId === '5a5addf5-dd46-4b62-bf61-afcfbde59d90') { // The Boulevard
    for (const cat in BOULEVARD_GUIDS) {
      if (effectiveCategoryCodes[cat]) {
        effectiveCategoryCodes[cat] = BOULEVARD_GUIDS[cat];
      }
    }
  } else if (tenantId === '63251a82-8296-433a-92ed-faf696756545') { // The Bach
    for (const cat in BACH_GUIDS) {
      if (effectiveCategoryCodes[cat]) {
        effectiveCategoryCodes[cat] = BACH_GUIDS[cat];
      }
    }
  } else if (tenantId === '08b98d52-d3b2-4c47-b4ec-ef371f58cf60') { // Terrace Views
    effectiveCategoryCodes = {
      'Art and Messy Play': '7a992892-1afe-4a99-b3d7-5731ee0e38b9',
      'Food Costs': 'd90d4a87-52c4-4f4e-8fac-19509c31b0af',
      'Cleaning Supplies': 'de00f460-2ecb-4f57-8cbf-8f3d098db910',
      'Nappies and Wipes': '847f7094-e155-49fc-92f1-26aeb2ed114f',
      'Centre Purchases': '2952ea9f-462b-4580-9758-7aa63c20531e',
      'Kiri Room Resources': '78f47856-f8bc-4f47-bfe3-6cbd254cfb75',
      'Wai Room Resources': 'e2cc1329-1fc5-4980-8eea-6d77544ff6a4',
      'Nga Room Resources': '273a4d1a-4db0-4669-b4f9-56e791733f19',
      'Te Hui Room Resources': '24b70a03-adf3-4b47-88d4-7561c84e9b65',
      'Stationary and Office Expenses': 'd1188cb6-facf-4e17-9921-7e08b0d30212',
      'Meeting Costs': '4b9146f9-3ef7-483e-a89b-7e4467f136fe',
      'Staff Welfare': '51921203-4872-4131-ae6b-9de964cb1030',
      'Repairs and Maintenance': 'aba08e5b-50ec-4124-bf62-6ff7fcb6ce32'
    };
  } else if (tenantId === '8ee192cc-ac9d-46fd-8796-c653ded3753f') { // Livingstone Drive
    effectiveCategoryCodes = {
      'Art and Messy Play': 'c631842f-6bb1-44eb-a951-a676bbbd69e2',
      'Food Costs': '62fa07ef-d18f-4623-ac33-55223e066334',
      'Cleaning Supplies': 'f7435692-f01d-49a9-b5b1-bb8c85de1375',
      'Nappies and Wipes': 'c0e8b9e2-0c92-4452-ab77-9be8f4466ebd',
      'Centre Purchases': '967ade9f-9460-44ec-896b-bbf4c9fb778d',
      'Kiri Room Resources': '01b6cdf8-f194-41cc-a7ba-1b85c26442d4',
      'Wai Room Resources': 'fbb61557-a4d8-4977-9193-d7a36907c6c2',
      'Nga Room Resources': '93327a8b-3555-43cd-a986-0a6cdf11428f',
      'Te Hui Room Resources': '',
      'Stationary and Office Expenses': '466166aa-6ed3-4e45-b369-3b427ab89537',
      'Meeting Costs': '6f2f4110-de47-47e3-925f-d979c34909db',
      'Staff Welfare': 'ca25a323-0ef2-4295-ae85-64f357972e9b',
      'Repairs and Maintenance': '774cb6f0-3748-48fd-8a79-5b6ea22a95f7'
    };
  } else if (tenantId === 'b39bba96-4062-4223-a917-26f9f347d9e6') { // West Dune
    effectiveCategoryCodes = {
      'Art and Messy Play': 'd7a8daa1-774e-4a0d-bf6f-dc33b197450a',
      'Food Costs': 'ac040c83-0c88-4677-986b-183fb49ec24d',
      'Cleaning Supplies': '5191f287-9b27-45e7-b4b3-11f18321c7b8',
      'Nappies and Wipes': 'e7269558-2504-4633-b5cb-50930883ee73',
      'Centre Purchases': '4bb22a8d-8248-43a0-8b88-3ede6a3b7b25',
      'Kiri Room Resources': 'a9bf4549-81c3-477a-97d1-3e1e8fbcb4ca',
      'Wai Room Resources': '8b7ab7b9-95b6-48dd-80d4-877fa5f5a9c6',
      'Nga Room Resources': '16b37262-e12d-4ad8-9447-87c32d909d80',
      'Te Hui Room Resources': '',
      'Stationary and Office Expenses': 'afc0a311-220f-4109-9a87-13788ff73ec7',
      'Meeting Costs': 'a16f9e85-d363-4512-a60a-2687005a69f5',
      'Staff Welfare': '5b547e5b-7e23-417a-b733-426f8537dd3f',
      'Repairs and Maintenance': 'aaf69890-0d53-443f-a16b-dde11e8ba1f8'
    };
  }

  // Fetch P&L report
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;
  const url = `https://api.xero.com/api.xro/2.0/Reports/ProfitAndLoss?fromDate=${startDate}&toDate=${endDate}&paymentsOnly=true&standardLayout=true&timeframe=MONTH`;
  let data = null;
  let text = null;
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'xero-tenant-id': tenantId,
      },
    });
    text = await res.text();
    if (!res.ok) {
      throw new Error(`Xero ${res.status}: ${text || '(no body)'}`);
    }
    if (!text) {
      throw new Error('Xero returned empty body');
    }
    data = JSON.parse(text);
  } catch (err) {
    throw new Error('Failed to fetch P&L: ' + String(err));
  }

  const report = data?.Reports?.[0];
  // Build response
  const result = Object.entries(effectiveCategoryCodes).map(([displayName, accountId]) => {
    const months = extractMonthlyByAccountId(report, accountId);
    return { category: displayName, accountId, months };
  });

  return {
    data: result,
    meta: {
      timeframe: 'MONTH',
      fromDate: startDate,
      toDate: endDate,
      tenantId,
    },
  };
}

// --- GET handler ---
export async function GET(req: NextRequest) {
  try {
    // For GET, parse params from URL (e.g. /api/xero/actuals?tenantId=...&year=...)
    const { searchParams } = new URL(req.url);
    const accessToken = searchParams.get('accessToken');
    const year = searchParams.get('year') || new Date().getFullYear();
    const tenantId = searchParams.get('tenantId');
    const categoryAccountCodes = JSON.parse(searchParams.get('categoryAccountCodes') || '{}');
    if (!accessToken || !tenantId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    const payload = await fetchActuals({ accessToken, year, tenantId, categoryAccountCodes });
    // Transform payload to { months, series, data }
    const months = payload.data[0]?.months?.map((m: any) => m.label) || [];
    const series = payload.data.map((cat: any) => ({
      name: cat.category,
      data: cat.months.map((m: any) => m.amount)
    }));
    return NextResponse.json({ months, series, data: payload.data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}

// --- POST handler ---
export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }
  try {
    const payload = await fetchActuals(body);
    // Transform payload to { months, series, data }
    const months = payload.data[0]?.months?.map((m: any) => m.label) || [];
    const series = payload.data.map((cat: any) => ({
      name: cat.category,
      data: cat.months.map((m: any) => m.amount)
    }));
    return NextResponse.json({ months, series, data: payload.data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}

// GUID mapping for The Boulevard (tenantId: '5a5addf5-dd46-4b62-bf61-afcfbde59d90')
const BOULEVARD_GUIDS: { [category: string]: string } = {
  'Art and Messy Play': '33f84d8d-2939-4fd2-9c87-3cdfcb7611fa',
  'Food Costs': 'f0699985-ac0f-4462-87f4-e5d4b31df55e',
  'Cleaning Supplies': 'ac3fc7d4-9b64-41bf-afcc-d7be2ec25992',
  'Nappies and Wipes': '0a814619-8a98-453c-a2a2-0b5707036afb',
  'Centre Purchases': '1549dcb6-191e-4fcc-a01a-2126210d18a9',
  'Kiri Room Resources': '8515251f-1434-413d-a587-7f340bebdf93',
  'Wai Room Resources': 'a1626f49-b8f6-4ba3-945d-a290e22676cd',
  'Nga Room Resources': 'a1626f49-b8f6-4ba3-945d-a290e22676cd',
  'Stationary and Office Expenses': 'd0407a60-f7db-483d-b600-a7f1c94aa3ec',
  'Meeting Costs': 'cb3bac20-d065-488d-a287-603db2378a61',
  'Staff Welfare': '513e993f-4432-4198-a2c7-ae101e9e702d',
  'Repairs and Maintenance': '11233c86-273d-456d-a473-0fac144a2d25',
};

// This endpoint dynamically fetches Xero actuals for any centre/category mapping
// It expects: accessToken, year, tenantId, and a mapping of categories to Xero account codes

// ...existing code...
