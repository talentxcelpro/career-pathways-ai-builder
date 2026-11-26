/**
 * TalentXcel Production Protection Guardrail (scripts/staging-guard.ts)
 *
 * Enforces an explicit denylist against the production Supabase project
 * (dthlgsnakhoftinssokm) before any staging qualification or migration runs.
 */

const PRODUCTION_PROJECT_IDS = new Set(['dthlgsnakhoftinssokm']);

export function assertStagingEnvironment(env: Record<string, string | undefined>): void {
  const projectId = env.VITE_SUPABASE_PROJECT_ID || '';
  const supabaseUrl = env.VITE_SUPABASE_URL || '';
  const dbUrl = env.STAGING_DB_URL || '';

  if (!projectId || projectId.includes('<REPLACE_WITH')) {
    throw new Error('BLOCKED: Staging project ID is missing or unconfigured.');
  }

  if (PRODUCTION_PROJECT_IDS.has(projectId)) {
    throw new Error(`CRITICAL SAFETY ABORT: Project ID "${projectId}" is PRODUCTION. Staging execution denied.`);
  }

  for (const prodId of PRODUCTION_PROJECT_IDS) {
    if (supabaseUrl.includes(prodId) || dbUrl.includes(prodId)) {
      throw new Error(`CRITICAL SAFETY ABORT: Endpoint URL references production project "${prodId}".`);
    }
  }

  console.log(`✅ Staging Guard Passed: Target project "${projectId}" is verified non-production.`);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('staging-guard.ts')) {
  try {
    assertStagingEnvironment(process.env);
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
}
