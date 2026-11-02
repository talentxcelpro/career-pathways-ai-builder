// scripts/staging/setup-staging-test-identities.ts
// Sets up 4 isolated synthetic test identities in staging Supabase:
// - Candidate 1 (applied to Company A Job)
// - Candidate 2 (no applications)
// - Recruiter 1 (Company A)
// - Recruiter 2 (Company B)

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

const STAGING_URL = "https://pvwwtquuexhyydwihjbi.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzU5MjU3NiwiZXhwIjoyMTA5MTY4NTc2fQ.fnYAXFI51Rpc6-GrnKN2Ui-Cyj_6K0aundMWZi0oJEI";

const adminClient = createClient(STAGING_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

export interface TestIdentity {
  role: string;
  email: string;
  userId: string;
  token: string;
  companyId?: string;
}

export async function setupTestIdentities(): Promise<Record<string, TestIdentity>> {
  console.log("Setting up synthetic staging test identities...");

  const identitiesConfig = [
    { key: "candidate1", email: "audit_cand1@talentxcel-audit.local", role: "candidate" },
    { key: "candidate2", email: "audit_cand2@talentxcel-audit.local", role: "candidate" },
    { key: "recruiter1", email: "audit_rec1@talentxcel-audit.local", role: "employer" },
    { key: "recruiter2", email: "audit_rec2@talentxcel-audit.local", role: "employer" },
  ];

  const identities: Record<string, TestIdentity> = {};

  for (const cfg of identitiesConfig) {
    // 1. Check if user already exists
    const { data: userList } = await adminClient.auth.admin.listUsers();
    let user = userList?.users?.find((u) => u.email === cfg.email);

    if (!user) {
      const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
        email: cfg.email,
        password: "AuditPassword123!Secure",
        email_confirm: true,
      });
      if (createErr || !newUser?.user) {
        throw new Error(`Failed to create test user ${cfg.email}: ${createErr?.message}`);
      }
      user = newUser.user;
    }

    // 2. Generate session / JWT token
    const { data: sessionData, error: signinErr } = await adminClient.auth.signInWithPassword({
      email: cfg.email,
      password: "AuditPassword123!Secure",
    });

    if (signinErr || !sessionData.session) {
      throw new Error(`Failed to sign in ${cfg.email}: ${signinErr?.message}`);
    }

    identities[cfg.key] = {
      role: cfg.role,
      email: cfg.email,
      userId: user.id,
      token: sessionData.session.access_token,
    };
  }

  // 3. Set up Company A for Recruiter 1
  const companyAId = "11111111-aaaa-aaaa-aaaa-111111111111";
  await adminClient.from("companies").upsert({
    id: companyAId,
    name: "Audit Corp A",
    website: "https://audit-corp-a.local",
  });

  await adminClient.from("company_team_members").upsert({
    id: "11111111-cccc-cccc-cccc-111111111111",
    company_id: companyAId,
    user_id: identities.recruiter1.userId,
    role: "admin",
    is_active: true,
  });
  identities.recruiter1.companyId = companyAId;

  // 4. Set up Company B for Recruiter 2
  const companyBId = "22222222-bbbb-bbbb-bbbb-222222222222";
  await adminClient.from("companies").upsert({
    id: companyBId,
    name: "Audit Corp B",
    website: "https://audit-corp-b.local",
  });

  await adminClient.from("company_team_members").upsert({
    id: "22222222-cccc-cccc-cccc-222222222222",
    company_id: companyBId,
    user_id: identities.recruiter2.userId,
    role: "admin",
    is_active: true,
  });
  identities.recruiter2.companyId = companyBId;

  // 5. Post Job A under Company A
  const jobAId = "33333333-jjjj-jjjj-jjjj-333333333333";
  await adminClient.from("jobs").upsert({
    id: jobAId,
    company_id: companyAId,
    title: "Senior Audit Engineer",
    status: "active",
  });

  // 6. Post Job B under Company B
  const jobBId = "44444444-jjjj-jjjj-jjjj-444444444444";
  await adminClient.from("jobs").upsert({
    id: jobBId,
    company_id: companyBId,
    title: "Security Analyst",
    status: "active",
  });

  // 7. Candidate 1 applies to Job A (Company A)
  const app1Id = "55555555-aaaa-aaaa-aaaa-555555555555";
  await adminClient.from("job_applications").upsert({
    id: app1Id,
    job_id: jobAId,
    user_id: identities.candidate1.userId,
    status: "applied",
  });

  console.log("Synthetic test identities initialized successfully:");
  console.log(`- Candidate 1: ${identities.candidate1.userId} (Applied to Job A)`);
  console.log(`- Candidate 2: ${identities.candidate2.userId} (No applications)`);
  console.log(`- Recruiter 1: ${identities.recruiter1.userId} (Company A, owns Job A)`);
  console.log(`- Recruiter 2: ${identities.recruiter2.userId} (Company B, owns Job B)`);

  fs.writeFileSync("reports/staging_test_identities.json", JSON.stringify(identities, null, 2));
  return identities;
}

setupTestIdentities()
  .then(() => {
    console.log("Setup completed successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Setup error:", err);
    process.exit(1);
  });
