const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch5_submit_endpoints_audit.json'), 'utf8'));

data.forEach(d => {
  console.log(`[#${d.num}] ${d.name} (${d.domain})`);
  console.log(`    Status: ${d.statusCode} | Loc: ${d.location || 'NONE'}`);
  console.log(`    LoginRedirect: ${d.isRedirectToLogin} | HasForm: ${d.hasForm} | HasInputs: ${d.hasInputs}`);
  console.log(`    FreeMention: ${d.mentionsFree} | PaidPrices: ${d.paidPrices ? d.paidPrices.join(', ') : 'none'}`);
  console.log(`    Reciprocal: ${d.hasReciprocal}\n`);
});
