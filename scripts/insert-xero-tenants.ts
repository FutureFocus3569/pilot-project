// Script to insert all Xero tenants into Supabase xero_connections table
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lhismadtghpgvuuxioen.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Paste your tokens here
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN';
const REFRESH_TOKEN = 'YOUR_REFRESH_TOKEN';

const tenants = [
  { id: '08b98d52-d3b2-4c47-b4ec-ef371f58cf60', name: 'Future Focus - Terrace Views' },
  { id: '5a5addf5-dd46-4b62-bf61-afcfbde59d90', name: 'Future Focus - The Boulevard' },
  { id: '613cb02c-c997-49f9-bf2c-7b4eebb571d2', name: 'Future Focus - Papamoa Beach' },
  { id: '63251a82-8296-433a-92ed-faf696756545', name: 'Future Focus - The Bach' },
  { id: '8ee192cc-ac9d-46fd-8796-c653ded3753f', name: 'Future Focus - Livingstone Drive' },
  { id: 'b39bba96-4062-4223-a917-26f9f347d9e6', name: 'Future Focus - West Dune Limited' },
];

async function main() {
  if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  if (!ACCESS_TOKEN || !REFRESH_TOKEN) throw new Error('Paste your tokens in the script!');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  for (const t of tenants) {
    const { error } = await supabase
      .from('xero_connections')
      .upsert({
        tenant_id: t.id,
        tenant_name: t.name,
        access_token: ACCESS_TOKEN,
        refresh_token: REFRESH_TOKEN,
        updated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      }, { onConflict: 'tenant_id' });
    if (error) {
      console.error(`Failed to upsert ${t.name}:`, error.message);
    } else {
      console.log(`Upserted ${t.name}`);
    }
  }
  console.log('Done!');
}

main().catch(console.error);
