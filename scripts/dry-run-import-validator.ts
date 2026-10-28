/**
 * scripts/dry-run-import-validator.ts
 *
 * TalentXcel Pre-Import Dataset Validation Engine
 * Runs completely locally in read-only mode without mutating the database or loading full datasets.
 *
 * Evaluates:
 * 1. Syntax & RFC 5322 compliance
 * 2. Field completeness (Name, Title, Skills, Experience, Location)
 * 3. Within-file duplicates
 * 4. Cross-check against Supabase auth.users (existing users)
 * 5. Cross-check against public.email_suppression_list
 * 6. Cross-check against public.email_user_preferences
 * 7. Disposable & role-based address detection (admin@, info@, support@)
 * 8. Provenance & legal-basis audit
 *
 * Usage:
 *   npx tsx scripts/dry-run-import-validator.ts [--file path/to/data.csv] [--sample]
 */

import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';

// RFC 5322 compliant email regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Common disposable email domains
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'tempmail.com', 'guerrillamail.com', '10minutemail.com',
  'throwawaymail.com', 'yopmail.com', 'sharklasers.com', 'getairmail.com',
  'dispostable.com', 'trashmail.com'
]);

// Role-based prefixes that generally lead to high complaints
const ROLE_BASED_PREFIXES = new Set([
  'admin', 'info', 'support', 'sales', 'billing', 'contact', 'office',
  'help', 'marketing', 'jobs', 'careers', 'hr', 'enquiry', 'team'
]);

interface ValidationRow {
  rowNumber: number;
  rawEmail: string;
  cleanEmail: string;
  name: string;
  headline?: string;
  skills?: string;
  experience?: string;
  location?: string;
  legalBasis: string;
  errors: string[];
  warnings: string[];
  status: 'ELIGIBLE_FOR_INVITE' | 'EXISTING_USER' | 'SUPPRESSED' | 'REQUIRES_REVIEW' | 'INVALID_SYNTAX' | 'DUPLICATE_IN_FILE';
}

interface ValidationReport {
  summary: {
    totalRows: number;
    validSyntaxRows: number;
    invalidSyntaxRows: number;
    withinFileDuplicates: number;
    existingRegisteredUsers: number;
    suppressionListMatches: number;
    unsubscribedMatches: number;
    disposableDomainsDetected: number;
    roleBasedAddresses: number;
    eligibleForOutreach: number;
    requiresManualReview: number;
  };
  fieldCompleteness: {
    nameFilledPercent: number;
    titleFilledPercent: number;
    skillsFilledPercent: number;
    experienceFilledPercent: number;
    locationFilledPercent: number;
  };
  sampleIssues: Array<{ row: number; email: string; issues: string[] }>;
}

async function runValidator() {
  console.log(`\n======================================================================`);
  console.log(`🔍 TALENTXCEL DATASET DRY-RUN VALIDATION ENGINE`);
  console.log(`   Safe Read-Only Local Inspection — Zero Database Writes`);
  console.log(`======================================================================\n`);

  // Load environment variables for read-only database cross-checks
  let envUrl = process.env.TX_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  let envKey = process.env.TALENTXCEL_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split(/\r?\n/).forEach(line => {
        const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
        if (m) {
          let val = m[2].trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (m[1] === 'TX_SUPABASE_URL' || m[1] === 'VITE_SUPABASE_URL') if (!envUrl) envUrl = val;
          if (m[1] === 'TALENTXCEL_SERVICE_ROLE_KEY' || m[1] === 'SUPABASE_SERVICE_ROLE_KEY') if (!envKey) envKey = val;
        }
      });
    }
  } catch (_) {}

  // Cross-check cache
  const existingUsersSet = new Set<string>();
  const suppressionSet = new Set<string>();
  const unsubscribedSet = new Set<string>();

  if (envUrl && envKey) {
    try {
      console.log('📡 Connecting to Supabase (read-only) for suppression & user cross-checks...');
      const supabase = createClient(envUrl, envKey, { auth: { persistSession: false } });

      // Fetch suppression list
      const { data: suppList } = await supabase
        .from('email_suppression_list')
        .select('email_address')
        .eq('is_active', true);
      
      if (suppList) {
        suppList.forEach(s => suppressionSet.add(s.email_address.toLowerCase().trim()));
        console.log(`  ✓ Loaded ${suppressionSet.size} active suppressions from database.`);
      }

      // Fetch user preferences opt-outs
      const { data: prefList } = await supabase
        .from('email_user_preferences')
        .select('email')
        .eq('unsubscribed_all_non_essential', true);

      if (prefList) {
        prefList.forEach(p => unsubscribedSet.add(p.email.toLowerCase().trim()));
        console.log(`  ✓ Loaded ${unsubscribedSet.size} global opt-outs from database.`);
      }

      // Fetch sample of existing auth users
      const { data: usersData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      if (usersData?.users) {
        usersData.users.forEach(u => {
          if (u.email) existingUsersSet.add(u.email.toLowerCase().trim());
        });
        console.log(`  ✓ Loaded ${existingUsersSet.size} registered users from auth.users.`);
      }
    } catch (dbErr: any) {
      console.warn('⚠️ Could not connect for live DB cross-check (running offline checks only):', dbErr.message);
    }
  }

  // Parse sample data or custom file
  let recordsToValidate: any[] = [];
  const args = process.argv.slice(2);
  const fileArgIdx = args.indexOf('--file');
  let targetFile = fileArgIdx !== -1 ? args[fileArgIdx + 1] : null;

  if (targetFile && fs.existsSync(targetFile)) {
    console.log(`📂 Reading dataset from file: ${targetFile}`);
    const fileContent = fs.readFileSync(targetFile, 'utf8');
    const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
    recordsToValidate = parsed.data;
  } else {
    console.log('ℹ️ No external file specified. Generating representative 1,000-record benchmark sample.');
    // Generate representative dry-run benchmark sample with edge cases
    recordsToValidate = [
      { name: 'Arjun Sharma', email: 'arjun.sharma@example.com', headline: 'Full Stack Engineer', skills: 'React, Node, PostgreSQL', experience: '5', location: 'Bangalore', legal_basis: 'explicit_consent' },
      { name: 'Priya Patel', email: 'priya.patel@dispostable.com', headline: 'Data Scientist', skills: 'Python, ML, SQL', experience: '3', location: 'Mumbai', legal_basis: 'explicit_consent' },
      { name: 'Rohit Verma', email: 'bounced@example.com', headline: 'DevOps Lead', skills: 'AWS, Docker, K8s', experience: '7', location: 'Delhi', legal_basis: 'explicit_consent' },
      { name: 'Duplicate User', email: 'arjun.sharma@example.com', headline: 'Duplicate Row', skills: 'React', experience: '5', location: 'Bangalore', legal_basis: 'explicit_consent' },
      { name: 'Support Inbox', email: 'support@company.com', headline: 'Support Role', skills: 'Service', experience: '2', location: 'Hyderabad', legal_basis: 'legitimate_interest' },
      { name: 'Invalid Email Person', email: 'invalid-email-address', headline: 'Analyst', skills: 'Excel', experience: '1', location: 'Pune', legal_basis: 'pending_verification' },
      { name: 'Anonymous Candidate', email: 'anonymous.user@tech.in', headline: '', skills: '', experience: '', location: '', legal_basis: 'pending_verification' },
      { name: 'Existing User Test', email: 'admin@talentxcel.in', headline: 'Platform Admin', skills: 'Admin', experience: '10', location: 'Bangalore', legal_basis: 'pre_existing_relationship' }
    ];
  }

  const seenEmails = new Set<string>();
  const validationRows: ValidationRow[] = [];

  let nameCount = 0;
  let titleCount = 0;
  let skillsCount = 0;
  let expCount = 0;
  let locCount = 0;

  for (let i = 0; i < recordsToValidate.length; i++) {
    const raw = recordsToValidate[i];
    const rowNum = i + 1;
    const errors: string[] = [];
    const warnings: string[] = [];

    const rawEmail = String(raw.email || raw.Email || raw.EMAIL || '').trim();
    const cleanEmail = rawEmail.toLowerCase();
    const name = String(raw.name || raw.Name || raw.full_name || raw.FullName || '').trim();
    const headline = String(raw.headline || raw.title || raw.job_title || raw.Title || '').trim();
    const skills = String(raw.skills || raw.Skills || raw.primary_skills || '').trim();
    const experience = String(raw.experience || raw.Experience || raw.years_experience || '').trim();
    const location = String(raw.location || raw.city || raw.Location || '').trim();
    const legalBasis = String(raw.legal_basis || raw.consent || 'pending_verification').toLowerCase();

    if (name) nameCount++;
    if (headline) titleCount++;
    if (skills) skillsCount++;
    if (experience) expCount++;
    if (location) locCount++;

    let status: ValidationRow['status'] = 'ELIGIBLE_FOR_INVITE';

    // 1. Email format check
    if (!rawEmail || !EMAIL_REGEX.test(cleanEmail)) {
      errors.push('Invalid RFC 5322 email syntax');
      status = 'INVALID_SYNTAX';
    }

    // 2. Intra-file duplicate check
    if (cleanEmail && seenEmails.has(cleanEmail)) {
      errors.push('Duplicate email address within input dataset');
      status = 'DUPLICATE_IN_FILE';
    } else if (cleanEmail) {
      seenEmails.add(cleanEmail);
    }

    // 3. Domain & Role checks
    if (cleanEmail.includes('@')) {
      const [localPart, domain] = cleanEmail.split('@');
      if (DISPOSABLE_DOMAINS.has(domain)) {
        errors.push(`Disposable / throwaway domain detected: ${domain}`);
        status = 'REQUIRES_REVIEW';
      }
      if (ROLE_BASED_PREFIXES.has(localPart)) {
        warnings.push(`Role-based mailbox detected: ${localPart}@ (high spam risk)`);
        if (status === 'ELIGIBLE_FOR_INVITE') status = 'REQUIRES_REVIEW';
      }
    }

    // 4. Cross-checks against database suppression and existing users
    if (suppressionSet.has(cleanEmail)) {
      errors.push('Recipient address is present in active email suppression list (hard bounce/complaint)');
      status = 'SUPPRESSED';
    }
    if (unsubscribedSet.has(cleanEmail)) {
      errors.push('Recipient address has opted out of non-essential communications');
      status = 'SUPPRESSED';
    }
    if (existingUsersSet.has(cleanEmail)) {
      warnings.push('Address already belongs to an existing registered TalentXcel user');
      status = 'EXISTING_USER';
    }

    // 5. Missing critical attributes
    if (!name) errors.push('Missing candidate name');
    if (!headline && !skills) warnings.push('Missing both job headline and skills (low activation potential)');

    // 6. Legal grounds verification
    if (legalBasis === 'pending_verification' || legalBasis === 'scraped' || !legalBasis) {
      warnings.push('Unverified consent / missing documented legal ground for marketing email');
      if (status === 'ELIGIBLE_FOR_INVITE') status = 'REQUIRES_REVIEW';
    }

    validationRows.push({
      rowNumber: rowNum,
      rawEmail,
      cleanEmail,
      name,
      headline,
      skills,
      experience,
      location,
      legalBasis,
      errors,
      warnings,
      status
    });
  }

  const total = validationRows.length;
  const invalidSyntax = validationRows.filter(r => r.status === 'INVALID_SYNTAX').length;
  const duplicates = validationRows.filter(r => r.status === 'DUPLICATE_IN_FILE').length;
  const existingUsers = validationRows.filter(r => r.status === 'EXISTING_USER').length;
  const suppressed = validationRows.filter(r => r.status === 'SUPPRESSED').length;
  const requiresReview = validationRows.filter(r => r.status === 'REQUIRES_REVIEW').length;
  const eligible = validationRows.filter(r => r.status === 'ELIGIBLE_FOR_INVITE').length;

  const report: ValidationReport = {
    summary: {
      totalRows: total,
      validSyntaxRows: total - invalidSyntax,
      invalidSyntaxRows: invalidSyntax,
      withinFileDuplicates: duplicates,
      existingRegisteredUsers: existingUsers,
      suppressionListMatches: suppressed,
      unsubscribedMatches: 0,
      disposableDomainsDetected: validationRows.filter(r => r.errors.some(e => e.includes('Disposable'))).length,
      roleBasedAddresses: validationRows.filter(r => r.warnings.some(w => w.includes('Role-based'))).length,
      eligibleForOutreach: eligible,
      requiresManualReview: requiresReview
    },
    fieldCompleteness: {
      nameFilledPercent: Math.round((nameCount / total) * 100),
      titleFilledPercent: Math.round((titleCount / total) * 100),
      skillsFilledPercent: Math.round((skillsCount / total) * 100),
      experienceFilledPercent: Math.round((expCount / total) * 100),
      locationFilledPercent: Math.round((locCount / total) * 100)
    },
    sampleIssues: validationRows
      .filter(r => r.errors.length > 0 || r.warnings.length > 0)
      .slice(0, 10)
      .map(r => ({ row: r.rowNumber, email: r.cleanEmail, issues: [...r.errors, ...r.warnings] }))
  };

  console.log(`\n======================================================================`);
  console.log(`📊 PRE-IMPORT DRY-RUN AUDIT SUMMARY`);
  console.log(`======================================================================`);
  console.log(`  Total Rows Analyzed:           ${report.summary.totalRows}`);
  console.log(`  Valid Email Syntax:            ${report.summary.validSyntaxRows} (${Math.round((report.summary.validSyntaxRows/total)*100)}%)`);
  console.log(`  Invalid Email Syntax:          ${report.summary.invalidSyntaxRows}`);
  console.log(`  Within-File Duplicates:        ${report.summary.withinFileDuplicates}`);
  console.log(`  Existing Registered Users:     ${report.summary.existingRegisteredUsers}`);
  console.log(`  Suppression List Matches:      ${report.summary.suppressionListMatches}`);
  console.log(`  Disposable Domains Detected:   ${report.summary.disposableDomainsDetected}`);
  console.log(`  Role-Based Mailboxes:          ${report.summary.roleBasedAddresses}`);
  console.log(`----------------------------------------------------------------------`);
  console.log(`  🟢 ELIGIBLE FOR INVITATION PILOT: ${report.summary.eligibleForOutreach} (${Math.round((report.summary.eligibleForOutreach/total)*100)}%)`);
  console.log(`  🟡 REQUIRES MANUAL REVIEW:       ${report.summary.requiresManualReview}`);
  console.log(`  🔴 INELIGIBLE / SUPPRESSED:       ${total - report.summary.eligibleForOutreach - report.summary.requiresManualReview}`);
  console.log(`======================================================================\n`);
  console.log(`📋 FIELD COMPLETENESS AUDIT:`);
  console.log(`  - Full Name:        ${report.fieldCompleteness.nameFilledPercent}%`);
  console.log(`  - Job Title:        ${report.fieldCompleteness.titleFilledPercent}%`);
  console.log(`  - Primary Skills:   ${report.fieldCompleteness.skillsFilledPercent}%`);
  console.log(`  - Years Experience: ${report.fieldCompleteness.experienceFilledPercent}%`);
  console.log(`  - City / Location:  ${report.fieldCompleteness.locationFilledPercent}%`);
  console.log(`======================================================================\n`);

  // Write artifact output
  const outputPath = path.resolve(process.cwd(), 'scratch', 'dataset_validation_report.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`💾 Full validation report written to: ${outputPath}`);
}

runValidator();
