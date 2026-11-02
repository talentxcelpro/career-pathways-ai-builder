// scripts/staging/verify-staging-10-user-journeys.ts
// TASK 002H: PHASE 8 — 10 USER JOURNEYS REGRESSION AUDIT (STAGING)

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

const STAGING_URL = "https://pvwwtquuexhyydwihjbi.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzU5MjU3NiwiZXhwIjoyMTA5MTY4NTc2fQ.fnYAXFI51Rpc6-GrnKN2Ui-Cyj_6K0aundMWZi0oJEI";

interface JourneyResult {
  journeyId: number;
  name: string;
  status: "PASS" | "FAIL" | "CONDITIONAL";
  mode: "STAGING_RUNTIME" | "SOURCE_INSPECTION";
  details: string;
  evidence: any;
}

const journeyResults: JourneyResult[] = [];

async function runJourneys() {
  console.log("=============================================================================");
  console.log("TALENTXCEL TASK 002H: 10 USER JOURNEYS REGRESSION AUDIT (STAGING)");
  console.log("=============================================================================\n");

  const rawIdentities = fs.readFileSync("reports/staging_test_identities.json", "utf8");
  const identities = JSON.parse(rawIdentities);

  const cand1 = identities.candidate1;
  const rec1 = identities.recruiter1;

  const cand1Client = createClient(STAGING_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${cand1.token}` } },
  });
  const rec1Client = createClient(STAGING_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${rec1.token}` } },
  });
  const adminClient = createClient(STAGING_URL, SERVICE_KEY);

  // ---------------------------------------------------------------------------
  // 1. CANDIDATE REGISTRATION
  // ---------------------------------------------------------------------------
  console.log("1. Testing Candidate Registration & Auth Session...");
  const { data: candAuth, error: candAuthErr } = await cand1Client.auth.getUser();
  journeyResults.push({
    journeyId: 1,
    name: "Candidate Registration & Auth Session",
    status: candAuth?.user?.id === cand1.userId ? "PASS" : "FAIL",
    mode: "STAGING_RUNTIME",
    details: `User session active for ${candAuth?.user?.email}`,
    evidence: { userId: candAuth?.user?.id, email: candAuth?.user?.email },
  });

  // ---------------------------------------------------------------------------
  // 2. CANDIDATE PROFILE
  // ---------------------------------------------------------------------------
  console.log("2. Testing Candidate Profile Upsert...");
  const { data: profData, error: profErr } = await cand1Client
    .from("profiles")
    .upsert({
      id: cand1.userId,
      full_name: "Audit Candidate Alpha",
      about: "Senior Cloud Security Engineer",
    })
    .select()
    .single();

  journeyResults.push({
    journeyId: 2,
    name: "Candidate Profile Management",
    status: !profErr ? "PASS" : "FAIL",
    mode: "STAGING_RUNTIME",
    details: !profErr ? `Profile saved for ${profData?.full_name}` : `Error: ${profErr.message}`,
    evidence: { profData, error: profErr },
  });

  // ---------------------------------------------------------------------------
  // 3. RESUME RECORD CREATION
  // ---------------------------------------------------------------------------
  console.log("3. Testing Resume Record Storage...");
  const resumeId = "77777777-7777-7777-7777-777777777777";
  const { data: resumeData, error: resumeErr } = await cand1Client
    .from("resumes")
    .upsert({
      id: resumeId,
      user_id: cand1.userId,
      title: "Master Cybersecurity Resume",
      content: JSON.stringify({ skills: ["Penetration Testing", "Cloud Security"], experience: "7 years" }),
      is_primary: true,
    })
    .select()
    .single();

  journeyResults.push({
    journeyId: 3,
    name: "Resume Record Creation",
    status: !resumeErr ? "PASS" : "FAIL",
    mode: "STAGING_RUNTIME",
    details: !resumeErr ? `Resume created: ${resumeData?.title}` : `Error: ${resumeErr.message}`,
    evidence: { resumeData, error: resumeErr },
  });

  // ---------------------------------------------------------------------------
  // 4. RESUME DOWNLOAD TRACKING (SEC-004)
  // ---------------------------------------------------------------------------
  console.log("4. Testing Atomic Resume Download Tracking RPC...");
  const { data: rpcDown, error: rpcDownErr } = await cand1Client.rpc(
    "record_resume_download_atomic",
    { p_resume_id: resumeId }
  );

  journeyResults.push({
    journeyId: 4,
    name: "Resume Download Tracking (Atomic Counter)",
    status: rpcDown?.success ? "PASS" : "FAIL",
    mode: "STAGING_RUNTIME",
    details: rpcDown?.success
      ? `Atomic download recorded count: ${rpcDown.download_count}`
      : `Error: ${rpcDownErr?.message || rpcDown?.error}`,
    evidence: { rpcDown, rpcDownErr },
  });

  // ---------------------------------------------------------------------------
  // 5. ATS & AI ANALYSIS
  // ---------------------------------------------------------------------------
  console.log("5. Testing ATS & AI Edge Endpoint (gemini-ai)...");
  const aiRes = await fetch(`${STAGING_URL}/functions/v1/gemini-ai`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${cand1.token}`,
    },
    body: JSON.stringify({ action: "audit_ping", prompt: "Evaluate candidate match score" }),
  });
  const aiBody = await aiRes.json();
  journeyResults.push({
    journeyId: 5,
    name: "ATS and AI Analysis Gateway",
    status: aiRes.ok ? "PASS" : "FAIL",
    mode: "STAGING_RUNTIME",
    details: `Edge AI response status HTTP ${aiRes.status}`,
    evidence: { status: aiRes.status, body: aiBody },
  });

  // ---------------------------------------------------------------------------
  // 6. JOB SEARCH
  // ---------------------------------------------------------------------------
  console.log("6. Testing Job Search Query...");
  const { data: jobList, error: jobErr } = await cand1Client
    .from("jobs")
    .select("id, title, description, company_id, is_active")
    .eq("is_active", true);

  journeyResults.push({
    journeyId: 6,
    name: "Job Search & Browsing",
    status: !jobErr && (jobList?.length || 0) > 0 ? "PASS" : "FAIL",
    mode: "STAGING_RUNTIME",
    details: `Found ${jobList?.length || 0} active jobs for candidate search`,
    evidence: { count: jobList?.length, jobs: jobList },
  });

  // ---------------------------------------------------------------------------
  // 7. JOB APPLICATION
  // ---------------------------------------------------------------------------
  console.log("7. Testing Job Application Submission...");
  const newAppId = "88888888-8888-8888-8888-888888888888";
  const { data: appData, error: appErr } = await cand1Client
    .from("job_applications")
    .upsert({
      id: newAppId,
      job_id: "44444444-4444-4444-4444-444444444444",
      user_id: cand1.userId,
      status: "applied",
    })
    .select()
    .single();

  journeyResults.push({
    journeyId: 7,
    name: "Job Application Submission",
    status: !appErr ? "PASS" : "FAIL",
    mode: "STAGING_RUNTIME",
    details: !appErr ? `Application submitted successfully (${appData?.id})` : `Error: ${appErr.message}`,
    evidence: { appData, error: appErr },
  });

  // ---------------------------------------------------------------------------
  // 8. EMPLOYER DASHBOARD
  // ---------------------------------------------------------------------------
  console.log("8. Testing Employer Dashboard & Applicant Review...");
  const { data: recruiterApps, error: recAppErr } = await rec1Client
    .from("job_applications")
    .select("id, job_id, user_id, status")
    .eq("job_id", "33333333-3333-3333-3333-333333333333");

  journeyResults.push({
    journeyId: 8,
    name: "Employer Dashboard & Applicant Visibility",
    status: !recAppErr && (recruiterApps?.length || 0) > 0 ? "PASS" : "FAIL",
    mode: "STAGING_RUNTIME",
    details: `Employer successfully viewed ${recruiterApps?.length || 0} applications for company job`,
    evidence: { count: recruiterApps?.length, apps: recruiterApps },
  });

  // ---------------------------------------------------------------------------
  // 9. ADMIN OPERATIONS & ROLE ESCALATION DEFENSE (SEC-001)
  // ---------------------------------------------------------------------------
  console.log("9. Testing Admin Verification & Role Escalation Defense...");
  // Attempt unauthorized insert into user_roles by ordinary candidate
  const { error: roleEscalateErr } = await cand1Client
    .from("user_roles")
    .insert({
      user_id: cand1.userId,
      role: "admin",
    });

  // Call is_app_admin for candidate
  const { data: candAdminCheck } = await cand1Client.rpc("is_app_admin", {
    user_uuid: cand1.userId,
  });

  journeyResults.push({
    journeyId: 9,
    name: "Admin Operations & Role Escalation Defense",
    status: Boolean(roleEscalateErr) && candAdminCheck === false ? "PASS" : "FAIL",
    mode: "STAGING_RUNTIME",
    details: `Candidate self-elevation blocked: ${roleEscalateErr ? "YES (Denied)" : "VULNERABILITY: Permitted!"}. is_app_admin: ${candAdminCheck}`,
    evidence: { roleEscalateErr, candAdminCheck },
  });

  // ---------------------------------------------------------------------------
  // 10. SUBSCRIPTIONS & ENTITLEMENTS
  // ---------------------------------------------------------------------------
  console.log("10. Testing Subscriptions & Entitlements Table...");
  // Verify subscription tiers catalog query
  const { data: tiers, error: subErr } = await cand1Client
    .from("pro_subscription_tiers")
    .select("id, name, price, billing_period, is_active")
    .eq("is_active", true);

  journeyResults.push({
    journeyId: 10,
    name: "Subscriptions and Entitlements",
    status: !subErr ? "PASS" : "FAIL",
    mode: "STAGING_RUNTIME",
    details: !subErr ? `Subscription tiers catalog operational (${tiers?.length || 0} active tiers available)` : `Error: ${subErr.message}`,
    evidence: { tiers, error: subErr },
  });

  // ---------------------------------------------------------------------------
  // SUMMARY RESULTS
  // ---------------------------------------------------------------------------
  console.log("\n=============================================================================");
  console.log("10 USER JOURNEYS EXECUTION SUMMARY");
  console.log("=============================================================================");

  let passCount = 0;
  for (const j of journeyResults) {
    const icon = j.status === "PASS" ? "✅" : "❌";
    console.log(`${icon} [JOURNEY ${j.journeyId}] ${j.name} -> ${j.status} (${j.mode})`);
    console.log(`   ${j.details}`);
    if (j.status === "PASS") passCount++;
  }

  console.log("\n-----------------------------------------------------------------------------");
  console.log(`TOTAL USER JOURNEYS: ${journeyResults.length} | PASSED: ${passCount} | FAILED: ${journeyResults.length - passCount}`);
  console.log("=============================================================================");

  fs.writeFileSync(
    "reports/staging_user_journeys_audit.json",
    JSON.stringify({ timestamp: new Date().toISOString(), passCount, total: journeyResults.length, results: journeyResults }, null, 2)
  );
  console.log("Saved full report to reports/staging_user_journeys_audit.json");
}

runJourneys()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Execution failed:", err);
    process.exit(1);
  });
