/**
 * TASK 002N — Production Mutation Guard & Read-Only Safeguard Engine
 * Target: TalentXcel (https://talentxcel.in | Supabase: dthlgsnakhoftinssokm)
 * 
 * Enforces:
 * 1. Read-only execution against production systems
 * 2. Strict blocking of any state mutations (INSERT, UPDATE, DELETE, user creation, document upload, payments)
 * 3. 8-field verification recording schema with non-negotiable state_mutation_occurred = false
 * 4. Proper classification: INDEPENDENTLY VERIFIED vs CODE INSPECTED vs UNTESTED vs D — Verification Blocked
 */

export const PRODUCTION_PROJECT_REF = 'dthlgsnakhoftinssokm';
export const PRODUCTION_DOMAIN = 'talentxcel.in';

export type ClassificationType = 
  | 'PASS (INDEPENDENTLY VERIFIED)'
  | 'PASS (CODE INSPECTED)'
  | 'UNTESTED'
  | 'D — Verification Blocked';

export interface VerificationRecord {
  environment: string;
  timestamp: string;
  exact_verification_method: string;
  expected_result: string;
  actual_result: string;
  evidence_reference: string;
  passive_or_active: 'Passive (Read-Only)' | 'Active (Isolated Synthetic)';
  state_mutation_occurred: false;
}

export class MutationGuardViolationError extends Error {
  constructor(message: string) {
    super(`[MUTATION GUARD VIOLATION] ${message}`);
    this.name = 'MutationGuardViolationError';
  }
}

/**
 * Checks whether a given URL, ref, or identifier references production infrastructure
 */
export function isProductionTarget(targetUrlOrRef: string): boolean {
  if (!targetUrlOrRef) return false;
  return (
    targetUrlOrRef.includes(PRODUCTION_PROJECT_REF) ||
    targetUrlOrRef.includes(PRODUCTION_DOMAIN)
  );
}

/**
 * Evaluates whether an HTTP method is permissible on production under TASK 002N
 */
export function assertReadOnlyHttpMethod(method: string, targetUrl: string): void {
  const upper = method.toUpperCase().trim();
  const isProd = isProductionTarget(targetUrl);

  if (isProd && !['GET', 'HEAD', 'OPTIONS'].includes(upper)) {
    throw new MutationGuardViolationError(
      `Method ${upper} is prohibited on production target (${targetUrl}). Only GET, HEAD, OPTIONS are permitted.`
    );
  }
}

/**
 * Evaluates whether a SQL query or command contains forbidden mutation statements
 */
export function assertReadOnlySql(sqlQuery: string, environmentRef: string): void {
  const isProd = isProductionTarget(environmentRef);
  if (!isProd) return;

  const normalized = sqlQuery.toUpperCase().trim();
  const forbiddenPatterns = [
    /\bINSERT\s+INTO\b/,
    /\bUPDATE\s+/,
    /\bDELETE\s+FROM\b/,
    /\bTRUNCATE\s+/,
    /\bDROP\s+TABLE\b/,
    /\bDROP\s+FUNCTION\b/,
    /\bALTER\s+TABLE\b/,
    /\bCREATE\s+USER\b/,
    /\bGRANT\s+/,
    /\bREVOKE\s+/
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(normalized)) {
      throw new MutationGuardViolationError(
        `SQL statement violates read-only guard: matches mutation pattern ${pattern.toString()}`
      );
    }
  }
}

/**
 * Creates and validates a compliant 8-field verification record
 */
export function createVerificationRecord(
  data: Omit<VerificationRecord, 'timestamp' | 'state_mutation_occurred'> & {
    timestamp?: string;
    state_mutation_occurred?: boolean;
  }
): VerificationRecord {
  if (data.state_mutation_occurred === true) {
    throw new MutationGuardViolationError(
      'state_mutation_occurred is TRUE. Zero production mutation is authorized under TASK 002N.'
    );
  }

  // Validate required non-empty string fields
  const requiredFields: (keyof Omit<VerificationRecord, 'state_mutation_occurred'>)[] = [
    'environment',
    'exact_verification_method',
    'expected_result',
    'actual_result',
    'evidence_reference',
    'passive_or_active'
  ];

  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== 'string' || (data[field] as string).trim() === '') {
      throw new Error(`Invalid verification record: missing required field "${field}"`);
    }
  }

  return {
    environment: data.environment,
    timestamp: data.timestamp || new Date().toISOString(),
    exact_verification_method: data.exact_verification_method,
    expected_result: data.expected_result,
    actual_result: data.actual_result,
    evidence_reference: data.evidence_reference,
    passive_or_active: data.passive_or_active,
    state_mutation_occurred: false
  };
}

/**
 * Classifies an audit control under TASK 002N rules
 */
export function classifyControl(opts: {
  isExecuted: boolean;
  isInspected: boolean;
  hasSufficientProductionAccess: boolean;
  requiresProductionMutation: boolean;
}): ClassificationType {
  if (!opts.hasSufficientProductionAccess || opts.requiresProductionMutation) {
    return 'D — Verification Blocked';
  }
  if (opts.isExecuted) {
    return 'PASS (INDEPENDENTLY VERIFIED)';
  }
  if (opts.isInspected) {
    return 'PASS (CODE INSPECTED)';
  }
  return 'UNTESTED';
}

// ----------------------------------------------------------------------------
// Self-Test & Diagnostic Execution
// ----------------------------------------------------------------------------
const isDirectExecution = process.argv[1]?.toLowerCase().includes('production-mutation-guard');
if (isDirectExecution) {
  console.log('\n================================================================');
  console.log('TASK 002N — PRODUCTION MUTATION GUARD VERIFICATION');
  console.log('Testing Read-Only Safeguards & Enforcement Boundaries');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function runTest(name: string, fn: () => void) {
    try {
      fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // Test 1: Production URL Target Detection
  runTest('Detects Production Supabase Reference', () => {
    if (!isProductionTarget(`https://${PRODUCTION_PROJECT_REF}.supabase.co`)) {
      throw new Error('Failed to identify production Supabase project ref');
    }
  });

  runTest('Detects Production Domain', () => {
    if (!isProductionTarget(`https://${PRODUCTION_DOMAIN}/api/jobs`)) {
      throw new Error('Failed to identify production domain');
    }
  });

  runTest('Allows Non-Production Staging Target', () => {
    if (isProductionTarget('https://pvwwtquuexhyydwihjbi.supabase.co')) {
      throw new Error('Staging wrongly flagged as production');
    }
  });

  // Test 2: HTTP Verb Guarding
  runTest('Permits Read-Only GET on Production', () => {
    assertReadOnlyHttpMethod('GET', `https://${PRODUCTION_PROJECT_REF}.supabase.co/rest/v1/profiles`);
  });

  runTest('Blocks POST on Production Target', () => {
    let blocked = false;
    try {
      assertReadOnlyHttpMethod('POST', `https://${PRODUCTION_PROJECT_REF}.supabase.co/rest/v1/profiles`);
    } catch (e: any) {
      if (e instanceof MutationGuardViolationError) blocked = true;
    }
    if (!blocked) throw new Error('POST was not blocked on production target');
  });

  runTest('Blocks DELETE on Production Target', () => {
    let blocked = false;
    try {
      assertReadOnlyHttpMethod('DELETE', `https://${PRODUCTION_DOMAIN}/api/users/123`);
    } catch (e: any) {
      if (e instanceof MutationGuardViolationError) blocked = true;
    }
    if (!blocked) throw new Error('DELETE was not blocked on production target');
  });

  // Test 3: SQL Statement Inspection
  runTest('Permits SELECT on Metadata & Tables', () => {
    assertReadOnlySql('SELECT id, role FROM public.user_roles WHERE user_id = $1;', PRODUCTION_PROJECT_REF);
  });

  runTest('Blocks INSERT statements', () => {
    let blocked = false;
    try {
      assertReadOnlySql('INSERT INTO public.user_roles (user_id, role) VALUES ($1, $2);', PRODUCTION_PROJECT_REF);
    } catch (e: any) {
      if (e instanceof MutationGuardViolationError) blocked = true;
    }
    if (!blocked) throw new Error('INSERT statement was not blocked');
  });

  runTest('Blocks UPDATE statements', () => {
    let blocked = false;
    try {
      assertReadOnlySql('UPDATE storage.buckets SET public = true WHERE id = $1;', PRODUCTION_PROJECT_REF);
    } catch (e: any) {
      if (e instanceof MutationGuardViolationError) blocked = true;
    }
    if (!blocked) throw new Error('UPDATE statement was not blocked');
  });

  runTest('Blocks TRUNCATE / DROP statements', () => {
    let blocked = false;
    try {
      assertReadOnlySql('TRUNCATE public.edge_rate_limits;', PRODUCTION_PROJECT_REF);
    } catch (e: any) {
      if (e instanceof MutationGuardViolationError) blocked = true;
    }
    if (!blocked) throw new Error('TRUNCATE statement was not blocked');
  });

  // Test 4: Verification Record Schema & Strict Invariant Check
  runTest('Generates Valid 8-Field Verification Record', () => {
    const record = createVerificationRecord({
      environment: `Production (${PRODUCTION_PROJECT_REF} - Read-Only)`,
      exact_verification_method: 'Inspect pg_policies for candidate confinement clause on storage.objects',
      expected_result: 'Candidate folder match enforced via auth.uid()::text = (storage.foldername(name))[1]',
      actual_result: 'Policy confirmed present in migration 20261102160000',
      evidence_reference: 'supabase/migrations/20261102160000_fix_candidate_storage_update_policy.sql#L12',
      passive_or_active: 'Passive (Read-Only)'
    });

    if (record.state_mutation_occurred !== false) {
      throw new Error('state_mutation_occurred must strictly be false');
    }
    if (Object.keys(record).length !== 8) {
      throw new Error(`Record must have exactly 8 fields, found ${Object.keys(record).length}`);
    }
  });

  runTest('Rejects Verification Record with Mutation True', () => {
    let rejected = false;
    try {
      createVerificationRecord({
        environment: 'Production',
        exact_verification_method: 'Write test user',
        expected_result: 'User created',
        actual_result: 'User created',
        evidence_reference: 'test',
        passive_or_active: 'Active (Isolated Synthetic)',
        state_mutation_occurred: true as any
      });
    } catch (e: any) {
      if (e instanceof MutationGuardViolationError) rejected = true;
    }
    if (!rejected) throw new Error('Failed to reject record with state_mutation_occurred = true');
  });

  // Test 5: Classification Rules
  runTest('Never classifies untested control as PASS', () => {
    const classification = classifyControl({
      isExecuted: false,
      isInspected: false,
      hasSufficientProductionAccess: true,
      requiresProductionMutation: false
    });
    if (classification === 'PASS (INDEPENDENTLY VERIFIED)' || classification === 'PASS (CODE INSPECTED)') {
      throw new Error(`Untested control wrongly classified as ${classification}`);
    }
    if (classification !== 'UNTESTED') {
      throw new Error(`Expected UNTESTED, got ${classification}`);
    }
  });

  runTest('Classifies insufficient production access as D — Verification Blocked', () => {
    const classification = classifyControl({
      isExecuted: false,
      isInspected: true,
      hasSufficientProductionAccess: false,
      requiresProductionMutation: false
    });
    if (classification !== 'D — Verification Blocked') {
      throw new Error(`Expected 'D — Verification Blocked', got ${classification}`);
    }
  });

  runTest('Classifies controls requiring production write as D — Verification Blocked', () => {
    const classification = classifyControl({
      isExecuted: false,
      isInspected: true,
      hasSufficientProductionAccess: true,
      requiresProductionMutation: true
    });
    if (classification !== 'D — Verification Blocked') {
      throw new Error(`Expected 'D — Verification Blocked', got ${classification}`);
    }
  });

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`STATUS: ${failed === 0 ? 'ALL SAFEGUARDS CERTIFIED' : 'GUARD FAILURE'}`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}
