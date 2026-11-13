const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const url = 'https://dthlgsnakhoftinssokm.supabase.co';
let serviceKey = '';
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  if (line.trim().startsWith('TALENTXCEL_SERVICE_ROLE_KEY=')) {
    serviceKey = line.split('=')[1].replace(/^['"]|['"]$/g, '').trim();
  }
});
const supabase = createClient(url, serviceKey);

async function checkCols() {
  const r = await supabase.from('jobs').select('*').limit(1);
  const cols = Object.keys(r.data[0]);
  console.log('Has country?', cols.includes('country'));
  console.log('Has visa_sponsored?', cols.includes('visa_sponsored'));
  console.log('Has visa_sponsorship?', cols.includes('visa_sponsorship'));
  console.log('Has relocation_assistance?', cols.includes('relocation_assistance'));
  console.log('Has applicant_location_requirements?', cols.includes('applicant_location_requirements'));
  console.log('Has salary_currency?', cols.includes('salary_currency'));
  console.log('Matched location/relocation/visa/currency cols:');
  console.log(cols.filter(c => c.includes('country') || c.includes('loc') || c.includes('visa') || c.includes('reloc') || c.includes('elig') || c.includes('curr')));
}
checkCols();
