import { SearchDemandIngestionEngine } from '../src/lib/seo/searchUniverse/searchDemandIngestionEngine';
import { GlobalIndustryHierarchy } from '../src/lib/seo/searchUniverse/globalIndustryHierarchy';

const queries = [
  'pharmacist jobs in srinagar',
  'pharmacist salary in dubai',
  'pharmacist resume',
  'pharmacist ats keywords',
  'pharmacist interview questions',
  'pharmacist government jobs',
  'hotel manager jobs in london',
  'hotel manager salary',
  'hotel manager interview questions',
  'civil engineer jobs in dubai',
  'registered nurse jobs in bangalore',
  'commercial pilot salary in dubai',
];

console.log('Testing cross-industry query ingestion:');
for (const q of queries) {
  const signal = SearchDemandIngestionEngine.processSingleSignal({
    sourceType: 'GSC',
    rawQuery: q,
    impressions: 1200,
    clicks: 45
  });
  console.log(`Query: "${q}" -> Intent: ${signal.detectedIntent.padEnd(14)} | Role: ${(signal.primaryRole || 'none').padEnd(25)} | Loc: ${(signal.primaryLocation?.canonicalName || 'none').padEnd(12)} | URL: ${signal.recommendedUrl}`);
}
