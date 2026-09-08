// scripts/seo/run-gsc-shorts-intelligence.ts
// TalentXcel Shorts Intelligence CLI Runner (Backwards Compatible Wrapper)
// Directly delegates to runSocialSearchIntelligencePipeline in run-gsc-social-intelligence.ts

import { fileURLToPath } from 'url';
import path from 'path';
import { runSocialSearchIntelligencePipeline } from './run-gsc-social-intelligence';

export async function runShortsCli() {
  console.log('[Backwards Compatibility] Delegating run-gsc-shorts-intelligence to run-gsc-social-intelligence...\n');
  return runSocialSearchIntelligencePipeline();
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectRun) {
  runShortsCli().catch((err) => {
    console.error('Fatal Shorts Intelligence Pipeline Error:', err);
    process.exit(1);
  });
}
