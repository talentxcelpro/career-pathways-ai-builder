// scripts/test-ai-referral-attribution.ts
import { detectAiReferral } from '../src/lib/analytics/aiReferralAttribution';

const cases = [
  {
    name: 'ChatGPT Search Referrer',
    url: new URL('https://talentxcel.in/resume/ats-check'),
    referrer: 'https://chatgpt.com/c/12345',
    expectedPlatform: 'chatgpt',
    expectedMedium: 'ai_search'
  },
  {
    name: 'Perplexity AI with Ref Parameter',
    url: new URL('https://talentxcel.in/talent-score?ref=perplexity'),
    referrer: '',
    expectedPlatform: 'perplexity',
    expectedMedium: 'ai_search'
  },
  {
    name: 'Google Gemini Referrer',
    url: new URL('https://talentxcel.in/career-map'),
    referrer: 'https://gemini.google.com/',
    expectedPlatform: 'gemini',
    expectedMedium: 'ai_assistant'
  },
  {
    name: 'Anthropic Claude Referrer',
    url: new URL('https://talentxcel.in/network'),
    referrer: 'https://claude.ai/chat/abc',
    expectedPlatform: 'claude',
    expectedMedium: 'ai_assistant'
  },
  {
    name: 'Microsoft Copilot Referrer',
    url: new URL('https://talentxcel.in/jobs'),
    referrer: 'https://copilot.microsoft.com/',
    expectedPlatform: 'copilot',
    expectedMedium: 'ai_search'
  },
  {
    name: 'Grok / xAI Referrer',
    url: new URL('https://talentxcel.in/talent'),
    referrer: 'https://grok.com/',
    expectedPlatform: 'grok',
    expectedMedium: 'ai_assistant'
  },
  {
    name: 'DeepSeek Referrer',
    url: new URL('https://talentxcel.in/salary'),
    referrer: 'https://chat.deepseek.com/',
    expectedPlatform: 'deepseek',
    expectedMedium: 'ai_assistant'
  },
  {
    name: 'DuckAssist Referrer',
    url: new URL('https://talentxcel.in/colleges'),
    referrer: 'https://duckduckgo.com/?q=test&ia=chat',
    expectedPlatform: 'duckassist',
    expectedMedium: 'ai_search'
  }
];

console.log('🧪 Testing AI Referral Attribution Engine...\n');
let allPassed = true;

for (const tc of cases) {
  const result = detectAiReferral(tc.url, tc.referrer);
  const ok = result.isAiReferral && result.platform === tc.expectedPlatform && result.medium === tc.expectedMedium;
  if (!ok) allPassed = false;
  console.log(`[${ok ? 'PASS ✅' : 'FAIL ❌'}] ${tc.name}`);
  console.log(`       Detected Platform: ${result.platform} (expected: ${tc.expectedPlatform})`);
  console.log(`       Detected Medium:   ${result.medium} (expected: ${tc.expectedMedium})\n`);
}

if (allPassed) {
  console.log('🎉 ALL AI REFERRAL DETECTION TEST CASES PASSED!');
} else {
  console.error('⚠️ SOME AI REFERRAL CASES FAILED.');
  process.exit(1);
}
