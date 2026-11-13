const fs = require('fs');

let content = fs.readFileSync('scripts/seo-ci-gate.ts', 'utf8');

// 1. Add import
content = content.replace(
  "import { validateJobPosting, hasValidApplicationMethod } from '../src/lib/seo/jobPostingValidator.js';",
  "import { validateJobPosting, hasValidApplicationMethod } from '../src/lib/seo/jobPostingValidator.js';\nimport { runJobPostingJsonLdTests } from './test-jobposting-jsonld.js';"
);

// 2. Add test suite execution after line 332
const targetBlock = `  } catch (err: any) {
    record('JobPosting', 'Execution Failure', false, err.message, { severity: 'CRITICAL', reason: err.message });
  }`;

const replacementBlock = `  } catch (err: any) {
    record('JobPosting', 'Execution Failure', false, err.message, { severity: 'CRITICAL', reason: err.message });
  }

  // --- 1B. AUTOMATED JOBPOSTING JSON-LD SCHEMA TEST SUITE (Adjustment 7) ---
  console.log('\\n--- 1B. RUNNING AUTOMATED JOBPOSTING JSON-LD TESTS ---');
  try {
    const jsonLdTests = runJobPostingJsonLdTests();
    record(
      'JobPosting',
      'Automated JSON-LD Schema Suite (Required Fields, Description, Dates, Salary Units)',
      jsonLdTests.failed === 0,
      \`Executed \${jsonLdTests.passed + jsonLdTests.failed} assertions: \${jsonLdTests.passed} passed, \${jsonLdTests.failed} failed\`
    );
  } catch (testErr: any) {
    record('JobPosting', 'JSON-LD Test Suite Execution', false, testErr.message);
  }`;

content = content.replace(targetBlock, replacementBlock);

fs.writeFileSync('scripts/seo-ci-gate.ts', content, 'utf8');
console.log('Successfully wired JobPosting JSON-LD automated tests into scripts/seo-ci-gate.ts');
