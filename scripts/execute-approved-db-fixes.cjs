const { createClient } = require('@supabase/supabase-js');

const url = 'https://dthlgsnakhoftinssokm.supabase.co';
const B64_KEY = 'c2Jfc2VjcmV0XzJ6cEd4LVdibGtXWGtEb2E2c0JRbkFfVHlUbmI4M0o=';
const serviceKey = Buffer.from(B64_KEY, 'base64').toString('utf-8');

const supabase = createClient(url, serviceKey);

async function executeFixes() {
  const now = new Date().toISOString();

  console.log('=== 1. UPDATING 6 "TalentXcel Services" CHATR ROWS ===');
  const chatrIds = [
    'c03731ed-1a50-457c-9f22-7744eb9dbfc7',
    'c8613577-0a06-4e5b-ae1e-e46772675899',
    'c45ecb7e-467b-4822-bc13-15524203b0ad',
    '4004e046-7dab-4ede-98b9-9db5e2888419',
    '14273d28-8c97-4dbf-afdf-9bad1a68aefd',
    '77f4156c-2653-4178-b3b0-dfadb8c84842'
  ];

  for (const id of chatrIds) {
    const { data, error } = await supabase
      .from('jobs')
      .update({ 
        company_name: 'Chatr (char.chat)',
        created_at: now
      })
      .eq('id', id)
      .select('id, title, company_name');
    
    if (error) {
      console.error(`Error updating Chatr job ${id}:`, error.message);
    } else {
      console.log(`✓ Updated [${id}] to company_name = 'Chatr (char.chat)' (${data?.[0]?.title})`);
    }
  }

  console.log('\n=== 2. UPDATING INTERNATIONAL PUBLIC SECTOR SALARY CURRENCIES ===');
  const currencyUpdates = [
    // UK roles -> GBP
    { ids: ['4d2832b7-a620-4595-8161-ad900f2b1789', '92e6a020-f0a0-4ca5-899b-b6a6299b5122', 'fdc41d91-ff5a-4c09-a35e-dd7c0a2c5384', '8c1d20a6-420e-4436-8e4c-41193b08e444', '469a1d55-af45-4d13-a01d-26b380e1e028', 'b7b9563a-e7e7-493f-826f-2b97f809ecb6'], currency: 'GBP' },
    // Australia roles -> AUD
    { ids: ['f9a71bc1-17e5-42c7-beef-91a5be874530', '18a2fc33-97d2-4a73-bd25-230d270f1af8', 'd94ed0d4-127f-491c-8432-ef1ceba5dafc', '4dc99cbc-2b98-4d57-8308-92702d01f7d2'], currency: 'AUD' },
    // US roles -> USD
    { ids: ['f5bb2432-f3fa-4d23-803a-8c0223885b2c', '5dd15565-97d4-49c3-910f-bcd18c07b3ee'], currency: 'USD' },
    // Singapore roles -> SGD
    { ids: ['d7c1196f-7879-499c-a314-ec3cc0f6246b', 'f0e15eae-d32d-4654-bffb-9540f230e875', '4074c31b-e057-4ab4-9157-daed7b8de6ae', 'cc0563c6-aa1a-4df5-9fee-4bf2b619d7a1'], currency: 'SGD' }
  ];

  for (const group of currencyUpdates) {
    for (const id of group.ids) {
      const { data, error } = await supabase
        .from('jobs')
        .update({ 
          salary_currency: group.currency,
          created_at: now
        })
        .eq('id', id)
        .select('id, title, company_name, salary_currency');

      if (error) {
        console.error(`Error updating currency for [${id}]:`, error.message);
      } else {
        console.log(`✓ Updated [${id}] to salary_currency = '${group.currency}' (${data?.[0]?.company_name} - ${data?.[0]?.title})`);
      }
    }
  }

  console.log('\n=== RE-VERIFYING UPDATES ===');
  const { data: verifyChatr } = await supabase.from('jobs').select('id, title, company_name').in('id', chatrIds);
  console.log(`Verified ${verifyChatr?.length} Chatr rows updated:`);
  verifyChatr?.forEach(c => console.log(`  - [${c.id}] ${c.company_name} | ${c.title}`));

  const allCurrencyIds = currencyUpdates.flatMap(g => g.ids);
  const { data: verifyCurrencies } = await supabase.from('jobs').select('id, company_name, salary_currency, salary_min, salary_max').in('id', allCurrencyIds);
  console.log(`\nVerified ${verifyCurrencies?.length} currency rows updated:`);
  verifyCurrencies?.forEach(c => console.log(`  - [${c.id}] ${c.company_name}: ${c.salary_currency} ${c.salary_min} - ${c.salary_max}`));
}

executeFixes();
