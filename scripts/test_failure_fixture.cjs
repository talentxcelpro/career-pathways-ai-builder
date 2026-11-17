const { validateTestGRevocation } = require('./test_consent_adversarial_staging.cjs');

console.log('========================================================================');
console.log('TALENTXCEL QUALITY GATE: DELIBERATELY FAILING TEST FIXTURE RUNNER');
console.log('Purpose: Demonstrate that a synthetic leaked row fixture produces a');
console.log('         test failure and non-zero process exit code.');
console.log('========================================================================\n');

// Mock state where RPC and DB records succeeded
const mockRpc = { status: 200, body: { success: true } };
const mockConsent = [{ consent_status: 'revoked', revocation_timestamp: new Date().toISOString() }];
const mockAudit = [{ event_type: 'consent_granted' }, { event_type: 'consent_revoked' }];
const mockProfile = [{ is_profile_public: false, profile_visibility: 'private' }];

// SYNTHETIC FAILING FIXTURE: View leaks 1 candidate profile row despite revocation
const syntheticLeakedViewResponse = {
  status: 200,
  body: [
    {
      id: '0b28a473-bcbb-4c49-b291-f9ea0daf4add',
      full_name: 'Synthetic Leaked Candidate',
      is_profile_public: true
    }
  ]
};

console.log('[FIXTURE] Injecting synthetic leaked row into validateTestGRevocation()...');
const result = validateTestGRevocation(mockRpc, mockConsent, mockAudit, mockProfile, syntheticLeakedViewResponse);

console.log('\n[EVALUATION RESULT]');
console.log('Pass:', result.pass);
console.log('Evidence:', JSON.stringify(result.evidence, null, 2));

if (!result.pass) {
  console.error('\n========================================================================');
  console.error('FAILED AS EXPECTED: Revocation test G failed on synthetic leak fixture.');
  console.error(`Rows returned: ${result.evidence.viewRowsReturned} (Expected 0)`);
  console.error(`isProfileExcludedFromView: ${result.evidence.isProfileExcludedFromView} (Expected true)`);
  console.error('Test runner exiting with code 1.');
  console.error('========================================================================\n');
  process.exit(1);
} else {
  console.log('UNEXPECTED: Test passed on failing fixture!');
  process.exit(0);
}
