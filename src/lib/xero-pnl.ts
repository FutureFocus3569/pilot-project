import fetch from 'node-fetch';

export async function fetchXeroPnL({
  accessToken,
  tenantId,
  fromDate,
  toDate,
  trackingCategoryId, // optional
}: {
  accessToken: string;
  tenantId: string;
  fromDate: string; // '2025-01-01'
  toDate: string;   // '2025-01-31'
  trackingCategoryId?: string;
}) {
  let url = `https://api.xero.com/api.xro/2.0/Reports/ProfitAndLoss?fromDate=${fromDate}&toDate=${toDate}`;
  if (trackingCategoryId) {
    url += `&trackingCategoryID=${trackingCategoryId}`;
  }

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'xero-tenant-id': tenantId,
      'Accept': 'application/json',
    },
  });

  if (!res.ok) throw new Error(`Xero API error: ${res.statusText}`);
  return res.json();
}
