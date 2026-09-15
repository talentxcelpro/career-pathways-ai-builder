/**
 * Architectural Boundary Verification Script for UDX v3.0
 * 
 * Verifies:
 * 1. Domain Independence Acid Test:
 *    - Zero imports from 'domains/career' in core modules
 *    - No career primitives leaked into core definitions
 * 2. Dynamic Intent Collapse:
 *    - Intent collapse engine calculates dynamic N, not hardcoded 16
 * 3. Epistemic Status Coverage:
 *    - VERIFIED_TRUTH recognized alongside OBSERVED, MODELED, FORECAST, etc.
 * 4. Completeness of Core Modules:
 *    - All 11 core subsystems present and exported
 */

const fs = require('fs');
const path = require('path');

const UDX_ROOT = path.join(__dirname, '..', 'src', 'lib', 'udx');

console.log('=================================================================');
console.log(' UDX Universal Discovery & Intelligence OS v3.0 — Architecture Gate');
console.log('=================================================================\n');

let failed = false;

// 1. Check all required core subsystems
const requiredModules = [
  'core',
  'person',
  'world',
  'temporal',
  'foresight',
  'possibility',
  'reasoning',
  'evidence',
  'agents',
  'outcomes',
  'memory',
  'domains/career'
];

console.log('1. Checking Core Module Structure...');
requiredModules.forEach(mod => {
  const modPath = path.join(UDX_ROOT, mod);
  if (fs.existsSync(modPath) && fs.existsSync(path.join(modPath, 'index.ts'))) {
    console.log(`  ✓ Subsystem [${mod}] present and barrel-exported`);
  } else {
    console.error(`  ✗ Missing subsystem or barrel: [${mod}]`);
    failed = true;
  }
});

// 2. Check Domain Independence Acid Test
console.log('\n2. Running Domain Independence Acid Test on Core Modules...');
const coreDirs = [
  'core',
  'person',
  'world',
  'temporal',
  'foresight',
  'possibility',
  'reasoning',
  'evidence',
  'agents',
  'outcomes',
  'memory'
];

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(fullPath);
    }
  });
  return fileList;
}

const coreFiles = [];
coreDirs.forEach(d => {
  const fullDir = path.join(UDX_ROOT, d);
  if (fs.existsSync(fullDir)) {
    getAllFiles(fullDir, coreFiles);
  }
});

console.log(`  Found ${coreFiles.length} core TypeScript source files to verify.`);

coreFiles.forEach(file => {
  const relativeName = path.relative(UDX_ROOT, file);
  const content = fs.readFileSync(file, 'utf8');

  // Check 2a: No imports from domains/career
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('import ') && (trimmed.includes('domains/career') || trimmed.includes('CareerAdapter') || trimmed.includes('TalentXcelTruth'))) {
      console.error(`  ✗ ARCHITECTURAL VIOLATION: Core file [${relativeName}:${idx + 1}] imports from career domain: ${trimmed}`);
      failed = true;
    }
  });

  // Check 2b: Core primitives must not define career types
  lines.forEach((line, idx) => {
    // Only check type/interface declarations, not comments
    const trimmed = line.trim();
    if (trimmed.startsWith('export interface') || trimmed.startsWith('export type')) {
      const lower = trimmed.toLowerCase();
      if (
        lower.includes('interface job') ||
        lower.includes('interface resume') ||
        lower.includes('interface candidate') ||
        lower.includes('interface employer') ||
        lower.includes('type job') ||
        lower.includes('interface salary') ||
        lower.includes('type salary') ||
        lower.includes('interface recruitment') ||
        lower.includes('type recruitment') ||
        lower.includes('interface career')
      ) {
        console.error(`  ✗ ACID TEST FAILED: Leaked career type in core [${relativeName}:${idx + 1}]: ${trimmed}`);
        failed = true;
      }
    }
  });
});

if (!failed) {
  console.log('  ✓ Core passed Acid Test: Zero career domain leakage detected in core.');
}

// 3. Epistemic Status Check
console.log('\n3. Verifying Epistemic Status Integrity...');
const evidenceTypesPath = path.join(UDX_ROOT, 'evidence', 'EvidenceTypes.ts');
if (fs.existsSync(evidenceTypesPath)) {
  const content = fs.readFileSync(evidenceTypesPath, 'utf8');
  if (content.includes('VERIFIED_TRUTH') && content.includes('OBSERVED') && content.includes('FORECAST')) {
    console.log('  ✓ VERIFIED_TRUTH and tri-temporal epistemic statuses confirmed.');
  } else {
    console.error('  ✗ Missing VERIFIED_TRUTH in EpistemicStatus!');
    failed = true;
  }
} else {
  console.error('  ✗ Missing EvidenceTypes.ts');
  failed = true;
}

// 4. Check Dynamic Intent Collapse
console.log('\n4. Verifying Dynamic Intent Collapse...');
const collapsePath = path.join(UDX_ROOT, 'core', 'IntentCollapseEngine.ts');
if (fs.existsSync(collapsePath)) {
  const content = fs.readFileSync(collapsePath, 'utf8');
  if (content.includes('collapse(') && content.includes('discoveredCanonicalCount: clusters.length') && !content.includes('return 16;')) {
    console.log('  ✓ Intent collapse engine dynamic; computes N from discovered cluster count.');
  } else {
    console.error('  ✗ Hardcoded intent collapse detected!');
    failed = true;
  }
} else {
  console.error('  ✗ Missing IntentCollapseEngine.ts');
  failed = true;
}

console.log('\n=================================================================');
if (failed) {
  console.error(' ✗ ARCHITECTURAL VERIFICATION FAILED.');
  process.exit(1);
} else {
  console.log(' ✓ ALL ARCHITECTURAL GATES PASSED CLEANLY.');
  console.log('=================================================================\n');
  process.exit(0);
}
