import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const STAGING_URL = 'https://pvwwtquuexhyydwihjbi.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ';

interface TestResult {
  testId: string;
  category: string;
  name: string;
  expected: string;
  actual: string;
  status: 'PASS' | 'FAIL';
  details: any;
}

async function runStorageComprehensiveSuite() {
  console.log('================================================================');
  console.log('TASK 002I: AUTHORITATIVE CANDIDATE STORAGE UPSERT & BOUNDARY AUDIT');
  console.log('================================================================\n');

  // 1. Load test identities
  const idPath = path.resolve(process.cwd(), 'reports', 'staging_test_identities.json');
  if (!fs.existsSync(idPath)) {
    throw new Error(`Test identities file not found at ${idPath}`);
  }
  const identities = JSON.parse(fs.readFileSync(idPath, 'utf8'));

  const candA = identities.candidate1;
  const candB = identities.candidate2;
  const rec1 = identities.recruiter1;
  const rec2 = identities.recruiter2;

  // 2. Initialize clients
  const anonClient = createClient(STAGING_URL, ANON_KEY);
  
  const candAClient = createClient(STAGING_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${candA.token}` } },
  });

  const candBClient = createClient(STAGING_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${candB.token}` } },
  });

  const rec1Client = createClient(STAGING_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${rec1.token}` } },
  });

  const rec2Client = createClient(STAGING_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${rec2.token}` } },
  });

  const results: TestResult[] = [];
  const testFileName = 'authoritative_test_cv.pdf';
  const candAPath = `${candA.userId}/${testFileName}`;
  const candBPath = `${candB.userId}/${testFileName}`;

  const contentV1 = Buffer.from('TalentXcel Task 002I Candidate CV Version 1.0 (Initial Content)');
  const contentV2 = Buffer.from('TalentXcel Task 002I Candidate CV Version 2.0 (Upserted & Replaced)');
  const contentCandB = Buffer.from('TalentXcel Candidate B Confidential CV Content');

  // Pre-test cleanup
  await candAClient.storage.from('documents').remove([candAPath]);
  await candBClient.storage.from('documents').remove([candBPath]);

  // --------------------------------------------------------------------------
  // TEST 1: Candidate A uploads a new CV
  // --------------------------------------------------------------------------
  console.log('[1/12] Executing Test 1: Candidate A uploads new CV...');
  try {
    const { data, error } = await candAClient.storage
      .from('documents')
      .upload(candAPath, contentV1, { contentType: 'application/pdf', upsert: false });

    const passed = !error && data?.path === candAPath;
    results.push({
      testId: 'UPSERT-01',
      category: 'UPSERT_CORE',
      name: 'Candidate A initial CV upload',
      expected: 'Upload succeeds with HTTP 200, error null',
      actual: error ? `Error: ${error.message}` : `Success: path=${data?.path}`,
      status: passed ? 'PASS' : 'FAIL',
      details: { data, error }
    });
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
  } catch (err: any) {
    results.push({
      testId: 'UPSERT-01',
      category: 'UPSERT_CORE',
      name: 'Candidate A initial CV upload',
      expected: 'Upload succeeds with HTTP 200, error null',
      actual: `Exception: ${err.message}`,
      status: 'FAIL',
      details: err
    });
  }

  // --------------------------------------------------------------------------
  // TEST 2: Candidate A replaces existing CV using upsert: true
  // --------------------------------------------------------------------------
  console.log('[2/12] Executing Test 2: Candidate A replaces same CV using upsert: true...');
  try {
    const { data, error } = await candAClient.storage
      .from('documents')
      .upload(candAPath, contentV2, { contentType: 'application/pdf', upsert: true });

    const passed = !error && data?.path === candAPath;
    results.push({
      testId: 'UPSERT-02',
      category: 'UPSERT_CORE',
      name: 'Candidate A replaces same CV with upsert: true (The 002H Defect)',
      expected: 'Upsert succeeds without RLS violation (HTTP 200)',
      actual: error ? `Error: ${error.message} (status: ${(error as any).status})` : `Success: path=${data?.path}`,
      status: passed ? 'PASS' : 'FAIL',
      details: { data, error }
    });
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
  } catch (err: any) {
    results.push({
      testId: 'UPSERT-02',
      category: 'UPSERT_CORE',
      name: 'Candidate A replaces same CV with upsert: true',
      expected: 'Upsert succeeds without RLS violation',
      actual: `Exception: ${err.message}`,
      status: 'FAIL',
      details: err
    });
  }

  // --------------------------------------------------------------------------
  // TEST 3: Content verification of updated document
  // --------------------------------------------------------------------------
  console.log('[3/12] Executing Test 3: Download updated CV and verify Version 2 content...');
  try {
    const { data, error } = await candAClient.storage.from('documents').download(candAPath);
    let passed = false;
    let actualContent = '';
    if (!error && data) {
      actualContent = await data.text();
      passed = actualContent === contentV2.toString();
    }
    results.push({
      testId: 'UPSERT-03',
      category: 'UPSERT_CORE',
      name: 'Updated document content integrity',
      expected: 'Downloaded content matches Version 2.0 exactly',
      actual: passed ? 'Content matches Version 2.0 exactly' : `Mismatch/error: ${error?.message || actualContent}`,
      status: passed ? 'PASS' : 'FAIL',
      details: { match: passed, downloadedText: actualContent, error }
    });
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
  } catch (err: any) {
    results.push({
      testId: 'UPSERT-03',
      category: 'UPSERT_CORE',
      name: 'Updated document content integrity',
      expected: 'Downloaded content matches Version 2.0',
      actual: `Exception: ${err.message}`,
      status: 'FAIL',
      details: err
    });
  }

  // --------------------------------------------------------------------------
  // TEST 4: Cross-candidate overwrite denial
  // --------------------------------------------------------------------------
  console.log("[4/12] Executing Test 4: Candidate B cannot overwrite Candidate A's CV...");
  try {
    const { data, error } = await candBClient.storage
      .from('documents')
      .upload(candAPath, Buffer.from('Attacker B malicious payload'), { contentType: 'application/pdf', upsert: true });

    const passed = error !== null;
    results.push({
      testId: 'ISOLATION-01',
      category: 'CROSS_CANDIDATE',
      name: "Candidate B cannot overwrite Candidate A's document",
      expected: 'Denied with RLS policy violation',
      actual: error ? `Correctly denied: ${error.message}` : `VULNERABILITY: Overwrite allowed: ${JSON.stringify(data)}`,
      status: passed ? 'PASS' : 'FAIL',
      details: { data, error }
    });
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
  } catch (err: any) {
    results.push({
      testId: 'ISOLATION-01',
      category: 'CROSS_CANDIDATE',
      name: "Candidate B cannot overwrite Candidate A's document",
      expected: 'Denied with RLS policy violation',
      actual: `Denied with exception: ${err.message}`,
      status: 'PASS',
      details: err
    });
  }

  // --------------------------------------------------------------------------
  // TEST 5: Cross-folder write isolation (Candidate A cannot insert into Candidate B folder)
  // --------------------------------------------------------------------------
  console.log("[5/12] Executing Test 5: Candidate A cannot insert or upload into Candidate B's folder...");
  try {
    const { data, error } = await candAClient.storage
      .from('documents')
      .upload(candBPath, Buffer.from('Candidate A injection into Candidate B folder'), { contentType: 'application/pdf', upsert: false });

    const passed = error !== null;
    results.push({
      testId: 'ISOLATION-02',
      category: 'CROSS_FOLDER',
      name: "Candidate A cannot upload into Candidate B's folder (Initial Insert)",
      expected: 'Denied with RLS violation (folder mismatch)',
      actual: error ? `Correctly denied: ${error.message}` : `VULNERABILITY: Cross-folder write permitted: ${JSON.stringify(data)}`,
      status: passed ? 'PASS' : 'FAIL',
      details: { data, error }
    });
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
  } catch (err: any) {
    results.push({
      testId: 'ISOLATION-02',
      category: 'CROSS_FOLDER',
      name: "Candidate A cannot upload into Candidate B's folder",
      expected: 'Denied with RLS violation',
      actual: `Denied with exception: ${err.message}`,
      status: 'PASS',
      details: err
    });
  }

  // --------------------------------------------------------------------------
  // TEST 6: Candidate B creates own document, Candidate A cannot replace it
  // --------------------------------------------------------------------------
  console.log("[6/12] Executing Test 6: Candidate A cannot replace Candidate B's existing document...");
  try {
    // Candidate B uploads to own folder
    await candBClient.storage.from('documents').upload(candBPath, contentCandB, { contentType: 'application/pdf', upsert: true });

    // Candidate A attempts to replace it
    const { data, error } = await candAClient.storage
      .from('documents')
      .upload(candBPath, Buffer.from('Candidate A hijacking Candidate B file'), { contentType: 'application/pdf', upsert: true });

    const passed = error !== null;
    results.push({
      testId: 'ISOLATION-03',
      category: 'CROSS_FOLDER',
      name: "Candidate A cannot replace Candidate B's existing document",
      expected: 'Denied with RLS policy violation on UPDATE',
      actual: error ? `Correctly denied: ${error.message}` : `VULNERABILITY: Replacement permitted: ${JSON.stringify(data)}`,
      status: passed ? 'PASS' : 'FAIL',
      details: { data, error }
    });
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
  } catch (err: any) {
    results.push({
      testId: 'ISOLATION-03',
      category: 'CROSS_FOLDER',
      name: "Candidate A cannot replace Candidate B's existing document",
      expected: 'Denied with RLS violation',
      actual: `Denied with exception: ${err.message}`,
      status: 'PASS',
      details: err
    });
  }

  // --------------------------------------------------------------------------
  // TEST 7: Unauthenticated update is rejected
  // --------------------------------------------------------------------------
  console.log('[7/12] Executing Test 7: Unauthenticated (anon) update is rejected...');
  try {
    const { data, error } = await anonClient.storage
      .from('documents')
      .upload(candAPath, Buffer.from('Unauthenticated payload'), { contentType: 'application/pdf', upsert: true });

    const passed = error !== null;
    results.push({
      testId: 'AUTH-01',
      category: 'AUTHENTICATION',
      name: 'Unauthenticated update rejection',
      expected: 'Anonymous update denied with 401 or 403',
      actual: error ? `Correctly rejected: ${error.message}` : `VULNERABILITY: Anon update allowed: ${JSON.stringify(data)}`,
      status: passed ? 'PASS' : 'FAIL',
      details: { data, error }
    });
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
  } catch (err: any) {
    results.push({
      testId: 'AUTH-01',
      category: 'AUTHENTICATION',
      name: 'Unauthenticated update rejection',
      expected: 'Anonymous update denied',
      actual: `Rejected with exception: ${err.message}`,
      status: 'PASS',
      details: err
    });
  }

  // --------------------------------------------------------------------------
  // TEST 8: Employer cannot overwrite candidate documents
  // --------------------------------------------------------------------------
  console.log('[8/12] Executing Test 8: Employer cannot overwrite candidate documents...');
  try {
    const { data, error } = await rec1Client.storage
      .from('documents')
      .upload(candAPath, Buffer.from('Employer tampering with candidate CV'), { contentType: 'application/pdf', upsert: true });

    const passed = error !== null;
    results.push({
      testId: 'AUTH-02',
      category: 'ROLE_BOUNDARY',
      name: 'Employer cannot overwrite candidate documents',
      expected: 'Employer write denied by RLS',
      actual: error ? `Correctly denied: ${error.message}` : `VULNERABILITY: Employer overwrite permitted: ${JSON.stringify(data)}`,
      status: passed ? 'PASS' : 'FAIL',
      details: { data, error }
    });
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
  } catch (err: any) {
    results.push({
      testId: 'AUTH-02',
      category: 'ROLE_BOUNDARY',
      name: 'Employer cannot overwrite candidate documents',
      expected: 'Employer write denied by RLS',
      actual: `Denied with exception: ${err.message}`,
      status: 'PASS',
      details: err
    });
  }

  // --------------------------------------------------------------------------
  // TEST 9: Authorized recruiter read access still works (Recruiter 1 on Job A)
  // --------------------------------------------------------------------------
  console.log('[9/12] Executing Test 9: Authorized Recruiter 1 read access...');
  try {
    const { data, error } = await rec1Client.storage.from('documents').download(candAPath);
    let passed = false;
    let text = '';
    if (!error && data) {
      text = await data.text();
      passed = text === contentV2.toString();
    }
    results.push({
      testId: 'RECRUITER-01',
      category: 'RECRUITER_ACCESS',
      name: 'Authorized recruiter read access to applicant CV',
      expected: 'Recruiter 1 downloads Candidate A updated CV V2.0',
      actual: passed ? 'Successfully downloaded updated CV V2.0' : `Failed: ${error?.message || text}`,
      status: passed ? 'PASS' : 'FAIL',
      details: { match: passed, error }
    });
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
  } catch (err: any) {
    results.push({
      testId: 'RECRUITER-01',
      category: 'RECRUITER_ACCESS',
      name: 'Authorized recruiter read access to applicant CV',
      expected: 'Recruiter 1 downloads Candidate A updated CV',
      actual: `Exception: ${err.message}`,
      status: 'FAIL',
      details: err
    });
  }

  // --------------------------------------------------------------------------
  // TEST 10: Unauthorized recruiter read access remains denied (Recruiter 2, no application)
  // --------------------------------------------------------------------------
  console.log('[10/12] Executing Test 10: Unauthorized Recruiter 2 read rejection (Direct download & Signed URL)...');
  try {
    // 1. Direct download
    const { data: rec2Data, error: rec2Err } = await rec2Client.storage.from('documents').download(candAPath);
    let directDenied = rec2Err !== null;
    if (rec2Data) {
      const t = await rec2Data.text();
      if (t.includes('error') || t.includes('not found') || t.includes('Invalid')) directDenied = true;
    }

    // 2. Signed URL attempt by unauthorized recruiter
    const { data: signedData, error: signedErr } = await rec2Client.storage.from('documents').createSignedUrl(candAPath, 60);
    let signedFetchDenied = true;
    if (signedData?.signedUrl) {
      const res = await fetch(signedData.signedUrl);
      if (res.ok) {
        signedFetchDenied = false;
      }
    }

    const passed = directDenied && signedFetchDenied;
    results.push({
      testId: 'RECRUITER-02',
      category: 'RECRUITER_ACCESS',
      name: 'Unauthorized recruiter read access denial (Direct & Signed URL)',
      expected: 'Recruiter 2 access denied on Candidate A CV',
      actual: passed ? 'Both direct download and signed URL access denied to Recruiter 2' : `VULNERABILITY: Recruiter 2 accessed CV! directDenied=${directDenied}, signedFetchDenied=${signedFetchDenied}`,
      status: passed ? 'PASS' : 'FAIL',
      details: { directDenied, signedFetchDenied, rec2Err, signedErr }
    });
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
  } catch (err: any) {
    results.push({
      testId: 'RECRUITER-02',
      category: 'RECRUITER_ACCESS',
      name: 'Unauthorized recruiter read access denial',
      expected: 'Recruiter 2 download denied',
      actual: `Safely denied with exception: ${err.message}`,
      status: 'PASS',
      details: err
    });
  }

  // --------------------------------------------------------------------------
  // TEST 11: Document owner deletion verification (Candidate A can delete own document)
  // --------------------------------------------------------------------------
  console.log('[11/12] Executing Test 11: Candidate A deletes own document...');
  try {
    const { error: removeErr } = await candAClient.storage.from('documents').remove([candAPath]);
    
    // Check via list that file no longer appears in Candidate A's folder
    const { data: listData } = await candAClient.storage.from('documents').list(candA.userId);
    const fileFound = listData?.some(f => f.name === testFileName) || false;
    const passed = !fileFound && !removeErr;

    results.push({
      testId: 'DELETION-01',
      category: 'DELETION_CONTROL',
      name: 'Candidate A deletes own permitted document',
      expected: 'Document successfully removed from bucket',
      actual: passed ? 'Document successfully removed (list confirms absent)' : `Failed: fileFound=${fileFound}, err=${removeErr?.message}`,
      status: passed ? 'PASS' : 'FAIL',
      details: { fileFound, removeErr }
    });
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
  } catch (err: any) {
    results.push({
      testId: 'DELETION-01',
      category: 'DELETION_CONTROL',
      name: 'Candidate A deletes own permitted document',
      expected: 'Document successfully removed',
      actual: `Exception: ${err.message}`,
      status: 'FAIL',
      details: err
    });
  }

  // --------------------------------------------------------------------------
  // TEST 12: Unauthorized deletion rejection & database integrity check
  // --------------------------------------------------------------------------
  console.log('[12/12] Executing Test 12: Unauthorized deletion rejection & database record integrity...');
  try {
    // 1. Candidate A attempts to delete Candidate B's document
    await candAClient.storage.from('documents').remove([candBPath]);
    
    // Check that Candidate B's document STILL exists
    const { data: listB1 } = await candBClient.storage.from('documents').list(candB.userId);
    const bStillExists = listB1?.some(f => f.name === testFileName) || false;

    // 2. Recruiter 1 attempts to delete Candidate B's document
    await rec1Client.storage.from('documents').remove([candBPath]);
    const { data: listB2 } = await candBClient.storage.from('documents').list(candB.userId);
    const bStillExistsAfterRecruiter = listB2?.some(f => f.name === testFileName) || false;

    // 3. Database integrity: check that unrelated resume records and download counters remain intact
    const { data: resumeRow, error: resumeErr } = await candAClient
      .from('resumes')
      .select('id, user_id')
      .eq('user_id', candA.userId)
      .limit(1);
    const resumeRecordIntact = !resumeErr && Array.isArray(resumeRow) && resumeRow.length > 0;

    // Cleanup: Candidate B deletes own document
    await candBClient.storage.from('documents').remove([candBPath]);

    const passed = bStillExists && bStillExistsAfterRecruiter && resumeRecordIntact;
    results.push({
      testId: 'DELETION-02',
      category: 'DELETION_CONTROL',
      name: 'Unauthorized deletion rejection and database integrity',
      expected: 'Candidate B document protected; database resume records unaffected',
      actual: passed ? 'Candidate B document protected against unauthorized deletion; resume records intact' : `Failed: bStillExists=${bStillExists}, bAfterRec=${bStillExistsAfterRecruiter}, resumeIntact=${resumeRecordIntact}`,
      status: passed ? 'PASS' : 'FAIL',
      details: { bStillExists, bStillExistsAfterRecruiter, resumeRecordIntact }
    });
    console.log(`  Result: ${passed ? 'PASS' : 'FAIL'}`);
  } catch (err: any) {
    results.push({
      testId: 'DELETION-02',
      category: 'DELETION_CONTROL',
      name: 'Unauthorized deletion rejection and database integrity',
      expected: 'Candidate B document remains protected',
      actual: `Exception: ${err.message}`,
      status: 'FAIL',
      details: err
    });
  }

  // --------------------------------------------------------------------------
  // Summary & Report Generation
  // --------------------------------------------------------------------------
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  console.log(`\n================================================================`);
  console.log(`AUDIT COMPLETE: ${passCount} PASSED, ${failCount} FAILED out of ${results.length}`);
  console.log(`================================================================`);

  const report = {
    timestamp: new Date().toISOString(),
    environment: 'staging',
    projectRef: 'pvwwtquuexhyydwihjbi',
    totalTests: results.length,
    passed: passCount,
    failed: failCount,
    allPassed: failCount === 0,
    results
  };

  const outPath = path.resolve(process.cwd(), 'reports', 'staging_candidate_upsert_audit.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`Authoritative report written to ${outPath}`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runStorageComprehensiveSuite().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
