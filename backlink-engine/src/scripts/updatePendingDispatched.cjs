const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Arshid.Wani\\.gemini\\antigravity\\brain\\bbd3c102-f165-47f7-9eef-eeb4b56d4fa1';
const filePath = 'reports/TXC-PENDING-DISPATCHED-SUBMISSIONS.csv';

const newRow = '"TXC_DISP_004","AI SaaS Radar","aisaasradar.com","Free AI SaaS Directory","https://aisaasradar.com/submit-process.php","' + new Date().toISOString() + '","HTTP 200 Received (radar_sess=44ce43b68c1f837a66a44286f3b49477)","EDITORIAL_REVIEW_PENDING (3-5 days turnaround)","NO (Awaiting moderator queue)","DISPATCHED_AWAITING_PUBLICATION"';

const content = fs.readFileSync(filePath, 'utf8').trim() + '\n' + newRow + '\n';
fs.writeFileSync(filePath, content, 'utf8');

if (fs.existsSync(ARTIFACT_DIR)) {
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'TXC-PENDING-DISPATCHED-SUBMISSIONS.csv'), content, 'utf8');
}

console.log('Appended TXC_DISP_004 to TXC-PENDING-DISPATCHED-SUBMISSIONS.csv');
