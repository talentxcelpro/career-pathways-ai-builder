// scripts/ingest-google-vids.ts
// CLI script to ingest Google Vids MP4 files into TalentXcel Content Vaults

import { defaultGoogleVidsIngestor } from '../src/lib/social-marketing/vault/googleVidsIngestor';
import { defaultContentVault } from '../src/lib/social-marketing/vault/contentVaultProvider';

async function main() {
  console.log('====================================================');
  console.log('🚀 TALENTXCEL GOOGLE VIDS AUTOMATED INGESTOR');
  console.log('====================================================');
  console.log('Inbox Directory:   ', defaultGoogleVidsIngestor.getInboxPath());
  console.log('Web Vault Directory:', defaultContentVault.getWebVaultRoot());
  console.log('Disk Vault Root:    ', defaultContentVault.getVaultRoot());
  console.log('----------------------------------------------------');

  const startTime = Date.now();
  const results = await defaultGoogleVidsIngestor.scanAndIngestAll();

  console.log('====================================================');
  console.log(`✅ INGESTION COMPLETE: Processed ${results.length} video package(s) in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
  console.log('====================================================');
  for (const r of results) {
    console.log(`- [${r.status}] ${r.title} (${r.contentId}) on date ${r.scheduledDate}`);
    console.log(`  9:16 Short/Reel: ${r.mp4_9x16_path}`);
    if (r.mp4_16x9_path) console.log(`  16:9 Master:     ${r.mp4_16x9_path}`);
  }
}

main().catch(err => {
  console.error('Fatal error in Google Vids Ingestion:', err);
  process.exit(1);
});
