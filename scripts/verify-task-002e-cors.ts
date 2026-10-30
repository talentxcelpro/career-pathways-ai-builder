// scripts/verify-task-002e-cors.ts
// Automated Test Suite for Task 002E: SEC-009 Strict CORS Hardening Verification

import { isAllowedOrigin, getCorsHeaders } from '../supabase/functions/_shared/cors';

interface TestCase {
  name: string;
  origin: string | null | undefined;
  expectedAllowed: boolean;
  expectedHeaderOrigin: string;
}

const testCases: TestCase[] = [
  // 1. Production Origin
  {
    name: "Production Primary (www.talentxcel.in)",
    origin: "https://www.talentxcel.in",
    expectedAllowed: true,
    expectedHeaderOrigin: "https://www.talentxcel.in",
  },
  {
    name: "Production Apex (talentxcel.in)",
    origin: "https://talentxcel.in",
    expectedAllowed: true,
    expectedHeaderOrigin: "https://talentxcel.in",
  },

  // 2. Approved Subdomains
  {
    name: "Approved Subdomain: jobs.talentxcel.in",
    origin: "https://jobs.talentxcel.in",
    expectedAllowed: true,
    expectedHeaderOrigin: "https://jobs.talentxcel.in",
  },
  {
    name: "Approved Subdomain: employer.talentxcel.in",
    origin: "https://employer.talentxcel.in",
    expectedAllowed: true,
    expectedHeaderOrigin: "https://employer.talentxcel.in",
  },
  {
    name: "Approved Subdomain: admin.talentxcel.in",
    origin: "https://admin.talentxcel.in",
    expectedAllowed: true,
    expectedHeaderOrigin: "https://admin.talentxcel.in",
  },
  {
    name: "Approved Feature Subdomain (dynamic regex): staging-preview.talentxcel.in",
    origin: "https://staging-preview.talentxcel.in",
    expectedAllowed: true,
    expectedHeaderOrigin: "https://staging-preview.talentxcel.in",
  },

  // 3. Approved Preview Origin (strictly scoped to project & team)
  {
    name: "Approved Vercel Preview (Git Branch): career-pathways-ai-builder-git-main-talentxcelpro.vercel.app",
    origin: "https://career-pathways-ai-builder-git-main-talentxcelpro.vercel.app",
    expectedAllowed: true,
    expectedHeaderOrigin: "https://career-pathways-ai-builder-git-main-talentxcelpro.vercel.app",
  },
  {
    name: "Approved Vercel Preview (Deployment Hash): career-pathways-ai-builder-a1b2c3d4-talentxcelpro.vercel.app",
    origin: "https://career-pathways-ai-builder-a1b2c3d4-talentxcelpro.vercel.app",
    expectedAllowed: true,
    expectedHeaderOrigin: "https://career-pathways-ai-builder-a1b2c3d4-talentxcelpro.vercel.app",
  },
  {
    name: "Approved Vercel Canonical Project: career-pathways-ai-builder.vercel.app",
    origin: "https://career-pathways-ai-builder.vercel.app",
    expectedAllowed: true,
    expectedHeaderOrigin: "https://career-pathways-ai-builder.vercel.app",
  },

  // 4. Unrelated Vercel Project
  {
    name: "Unrelated Vercel Project: unrelated-project.vercel.app",
    origin: "https://unrelated-project.vercel.app",
    expectedAllowed: false,
    expectedHeaderOrigin: "https://talentxcel.in",
  },
  {
    name: "Unrelated Vercel Project with similar prefix: career-pathways-other.vercel.app",
    origin: "https://career-pathways-other.vercel.app",
    expectedAllowed: false,
    expectedHeaderOrigin: "https://talentxcel.in",
  },

  // 5. Malicious Suffix / Unanchored Spoof
  {
    name: "Malicious Suffix: career-pathways-ai-builder.vercel.app.attacker.com",
    origin: "https://career-pathways-ai-builder.vercel.app.attacker.com",
    expectedAllowed: false,
    expectedHeaderOrigin: "https://talentxcel.in",
  },
  {
    name: "Attacker-controlled Vercel subdomain: career-pathways-ai-builder-evil.vercel.app",
    origin: "https://career-pathways-ai-builder-evil.vercel.app",
    expectedAllowed: false,
    expectedHeaderOrigin: "https://talentxcel.in",
  },
  {
    name: "Spoofed team suffix: career-pathways-ai-builder-attacker-talentxcelpro.fake.app",
    origin: "https://career-pathways-ai-builder-attacker-talentxcelpro.fake.app",
    expectedAllowed: false,
    expectedHeaderOrigin: "https://talentxcel.in",
  },

  // 6. Arbitrary Third-Party Origin
  {
    name: "Arbitrary Third-Party: https://evil.com",
    origin: "https://evil.com",
    expectedAllowed: false,
    expectedHeaderOrigin: "https://talentxcel.in",
  },
  {
    name: "Arbitrary Third-Party: https://phishing-talentxcel.com",
    origin: "https://phishing-talentxcel.com",
    expectedAllowed: false,
    expectedHeaderOrigin: "https://talentxcel.in",
  },

  // 7. Missing Origin Header
  {
    name: "Missing Origin: empty string",
    origin: "",
    expectedAllowed: false,
    expectedHeaderOrigin: "https://talentxcel.in",
  },
  {
    name: "Missing Origin: null",
    origin: null,
    expectedAllowed: false,
    expectedHeaderOrigin: "https://talentxcel.in",
  },

  // 8. Capacitor / Mobile App Origin
  {
    name: "Capacitor Mobile: capacitor://localhost",
    origin: "capacitor://localhost",
    expectedAllowed: true,
    expectedHeaderOrigin: "capacitor://localhost",
  },
  {
    name: "Capacitor Mobile: http://localhost",
    origin: "http://localhost",
    expectedAllowed: true,
    expectedHeaderOrigin: "http://localhost",
  },

  // 9. Approved Development Origin
  {
    name: "Vite Localhost: http://localhost:5173",
    origin: "http://localhost:5173",
    expectedAllowed: true,
    expectedHeaderOrigin: "http://localhost:5173",
  },
];

console.log("================================================================================");
console.log("TASK 002E: AUTOMATED CORS HARDENING & STRICT PREVIEW VERIFICATION TEST SUITE");
console.log("================================================================================\n");

let passed = 0;
let failed = 0;

for (const tc of testCases) {
  const allowed = isAllowedOrigin(tc.origin as string);
  const headers = getCorsHeaders(tc.origin as string);
  const headerOrigin = headers["Access-Control-Allow-Origin"];

  const passAllowed = allowed === tc.expectedAllowed;
  const passHeader = headerOrigin === tc.expectedHeaderOrigin;

  if (passAllowed && passHeader) {
    passed++;
    console.log(`[PASS] ${tc.name}`);
    console.log(`       Origin: ${tc.origin ?? "<null>"} -> Allowed: ${allowed}, Header: ${headerOrigin}`);
  } else {
    failed++;
    console.error(`[FAIL] ${tc.name}`);
    console.error(`       Origin: ${tc.origin ?? "<null>"}`);
    console.error(`       Allowed: got ${allowed}, expected ${tc.expectedAllowed}`);
    console.error(`       Header: got ${headerOrigin}, expected ${tc.expectedHeaderOrigin}`);
  }
}

console.log("\n--------------------------------------------------------------------------------");
console.log(`CORS Test Results: ${passed} PASSED, ${failed} FAILED (${testCases.length} total)`);
console.log("--------------------------------------------------------------------------------");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("ALL CORS INVARIANTS SATISFIED SEC-009 SPECIFICATION.");
}
