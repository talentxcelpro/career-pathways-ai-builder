import { publisherDiscovery } from '../src/services/publisher/PublisherDiscoveryEngine';

const pilotIds = [
  // Batch 1 (5 Colleges + 5 Career Platforms)
  'pub-opp-0001', 'pub-opp-0002', 'pub-opp-0003', 'pub-opp-0004', 'pub-opp-0005',
  'pub-opp-0101', 'pub-opp-0102', 'pub-opp-0103', 'pub-opp-0104', 'pub-opp-0105',
  // Batch 2 (5 Colleges + 5 Career Platforms)
  'pub-opp-0006', 'pub-opp-0007', 'pub-opp-0008', 'pub-opp-0011', 'pub-opp-0012',
  'pub-opp-0106', 'pub-opp-0107', 'pub-opp-0108', 'pub-opp-0109', 'pub-opp-0111'
];

interface AuditFinding {
  id: string;
  name: string;
  domain: string;
  category: string;
  email: string;
  contactUrl: string;
  targetPage: string;
  previewUrl: string;
  suggestedAssetId: string;
  iframeSrc: string;
  hasContamination: boolean;
  contaminationDetails: string[];
  status: 'PASS' | 'DEFECTIVE';
}

const findings: AuditFinding[] = [];

for (const id of pilotIds) {
  const opp = publisherDiscovery.getOpportunityById(id);
  if (!opp) {
    console.error(`Missing opportunity: ${id}`);
    continue;
  }

  const drafts = opp.outreachDrafts;
  const emailBody = drafts?.emailBody || '';
  const emailSubject = drafts?.emailSubject || '';
  const contactMsg = drafts?.contactFormMessage || '';
  const fullText = `${emailSubject}\n${emailBody}\n${contactMsg}`;

  // Extract iframe src
  const iframeMatch = emailBody.match(/<iframe src="([^"]+)"/);
  const iframeSrc = iframeMatch ? iframeMatch[1] : 'NONE';

  // Extract preview URL from body
  const previewMatch = emailBody.match(/preview it live here:\s*\n([^\s\n]+)/i);
  const previewUrl = previewMatch ? previewMatch[1] : 'NONE';

  const contaminationDetails: string[] = [];

  // Check if college references another college (e.g. madras in a non-Madras record)
  if (opp.category === 'college') {
    if (opp.id !== 'pub-opp-0001' && (fullText.includes('madras') || fullText.includes('IIT Madras') || previewUrl.includes('madras'))) {
      contaminationDetails.push('Contaminated with IIT Madras references/preview URL');
    }
  }

  // Check if iframe snippet has hardcoded qa_to_sde when not qa_to_sde
  if (opp.suggestedEmbedCategory === 'college' && iframeSrc.includes('qa_to_sde')) {
    contaminationDetails.push('Embed iframe has hardcoded qa_to_sde instead of college slug');
  }
  if (opp.suggestedEmbedCategory === 'resume' && iframeSrc.includes('qa_to_sde')) {
    contaminationDetails.push('Embed iframe has hardcoded qa_to_sde instead of resume slug');
  }

  const hasContamination = contaminationDetails.length > 0;

  findings.push({
    id: opp.id,
    name: opp.name,
    domain: opp.domain,
    category: opp.category,
    email: opp.publicContactEmail,
    contactUrl: opp.contactPageUrl,
    targetPage: opp.targetPageUrl,
    previewUrl,
    suggestedAssetId: opp.suggestedAssetId,
    iframeSrc,
    hasContamination,
    contaminationDetails,
    status: hasContamination ? 'DEFECTIVE' : 'PASS'
  });
}

console.log('========================================================================');
console.log('PRE-CORRECTION AUDIT RESULTS (CURRENT STATE IN REPO)');
console.log('========================================================================\n');

for (const f of findings) {
  console.log(`[${f.status}] ${f.id} - ${f.name} (${f.domain})`);
  console.log(`  Category: ${f.category} | Asset: ${f.suggestedAssetId}`);
  console.log(`  Preview URL: ${f.previewUrl}`);
  console.log(`  Iframe src:  ${f.iframeSrc}`);
  if (f.hasContamination) {
    console.log(`  Defects:`);
    f.contaminationDetails.forEach(d => console.log(`    - ${d}`));
  }
  console.log('');
}

const defectiveCount = findings.filter(f => f.status === 'DEFECTIVE').length;
const passCount = findings.filter(f => f.status === 'PASS').length;
console.log(`Total Inspected: ${findings.length}`);
console.log(`Defective: ${defectiveCount}`);
console.log(`Pass: ${passCount}`);
