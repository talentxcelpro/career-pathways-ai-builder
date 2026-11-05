const fs = require('fs');
const path = require('path');

const deepData = JSON.parse(fs.readFileSync(path.join(__dirname, 'batch5_deep_results.json'), 'utf8'));

console.log('Total deep items:', deepData.length);

let withSubmitPage = 0;
let withForms = 0;
let withLogin = 0;
let paidOnly = 0;
let freeMentions = 0;

deepData.forEach(d => {
  if (d.submitPageAnalysis) {
    withSubmitPage++;
    if (d.submitPageAnalysis.hasForm) withForms++;
    if (d.submitPageAnalysis.hasLogin) withLogin++;
    if (d.submitPageAnalysis.hasPaidOnly) paidOnly++;
    if (d.submitPageAnalysis.hasFreeMention) freeMentions++;
  }
});

console.log({
  total: deepData.length,
  withSubmitPage,
  withForms,
  withLogin,
  paidOnly,
  freeMentions
});
