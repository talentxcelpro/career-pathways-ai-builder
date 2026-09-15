// scripts/dispatch-savantis-ses.ts
// Automated Amazon SES Dispatcher for Savantis 2026 Engineering Cohort (211 Candidates)
// Rate-limited, responsive HTML template, with UTM telemetry & zero-CAC referral tracking.

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Load .env or .env.local if present
function loadEnv() {
  const envPaths = ['.env.local', '.env'];
  for (const envFile of envPaths) {
    const fullPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...rest] = trimmed.split('=');
          if (key && rest.length > 0 && !process.env[key.trim()]) {
            process.env[key.trim()] = rest.join('=').replace(/^["'](.*)["']$/, '$1').trim();
          }
        }
      });
    }
  }
}

loadEnv();

interface StudentRecord {
  name: string;
  email: string;
  roll_number: string;
  gender: string;
  college: string;
  branch: string;
  university: string;
  graduation_year: string;
  graduation_percentage: string;
  target_surface: string;
}

const cohortFilePath = path.join(process.cwd(), 'scratch', 'savantis_2026_cohort.json');

function buildEmailHtml(student: StudentRecord): string {
  const cleanName = student.name.trim() || 'Engineering Graduate';
  const cleanCollege = student.college.trim() || 'Engineering College';
  const cleanBranch = student.branch.trim() || 'Engineering';
  const atsUrl = `https://talentxcel.in/resume?utm_source=campus_ses&utm_medium=email&utm_campaign=savantis_2026&college=${encodeURIComponent(cleanCollege)}&branch=${encodeURIComponent(cleanBranch)}`;
  const salaryUrl = `https://talentxcel.in/tools/salary-analyzer?role=${encodeURIComponent(cleanBranch + ' Engineer')}&exp=0`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Free ATS Resume Check for ${cleanCollege} Placements</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    
    <!-- HEADER -->
    <tr>
      <td style="padding: 28px 32px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <span style="font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">Talent<span style="color: #38bdf8;">Xcel</span></span>
            </td>
            <td align="right">
              <span style="background-color: #38bdf8; color: #0f172a; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;">Campus 2026</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- BODY CONTENT -->
    <tr>
      <td style="padding: 32px;">
        <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0; line-height: 1.4;">
          Hi ${cleanName}, check your ATS Resume Score for ${cleanCollege} campus placements
        </h2>
        
        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 16px 0;">
          As you prepare for upcoming 2026 engineering campus drives in <strong>${cleanBranch}</strong>, we launched a free instant ATS Resume Diagnostic tool designed specifically for Indian engineering freshers.
        </p>

        <!-- VALUE BOX -->
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px; margin: 20px 0;">
          <p style="font-size: 13px; font-weight: 700; color: #166534; margin: 0 0 10px 0;">
            🚀 What You Get in 10 Seconds (100% Free):
          </p>
          <ul style="font-size: 13px; color: #15803d; margin: 0; padding-left: 20px; line-height: 1.6;">
            <li><strong>Instant Parseability Score (0–100):</strong> Test against top enterprise recruiters (TCS, Infosys, Wipro, Tier-1 Tech).</li>
            <li><strong>Skill Gap Checklist:</strong> Identify missing core keywords for ${cleanBranch} roles.</li>
            <li><strong>In-Hand Salary Benchmark:</strong> Real 2026 fresher salary expectations across Bangalore, Hyderabad, and Pune.</li>
          </ul>
        </div>

        <!-- PRIMARY CTA BUTTON -->
        <div style="text-align: center; margin: 28px 0;">
          <a href="${atsUrl}" style="background-color: #0284c7; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 28px; border-radius: 10px; display: inline-block; box-shadow: 0 2px 4px rgba(2, 132, 199, 0.2);">
            Check My Resume Score (Free) →
          </a>
          <p style="font-size: 11px; color: #94a3b8; margin-top: 8px;">No signup or credit card required</p>
        </div>

        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;">

        <!-- SECONDARY LINK -->
        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0;">
          💡 Want to see fresher take-home salary trends? <a href="${salaryUrl}" style="color: #0284c7; font-weight: 600; text-decoration: none;">View 2026 Salary Calculator &rarr;</a>
        </p>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.5;">
          You received this campus career preparation circular for <strong>${cleanCollege} (${cleanBranch})</strong>.<br>
          TalentXcel AI Career Operating System • <a href="https://talentxcel.in" style="color: #64748b; text-decoration: underline;">talentxcel.in</a>
        </p>
      </td>
    </tr>

  </table>
</body>
</html>
  `;
}

async function runCampaign() {
  const isDryRun = process.env.SES_DISPATCH !== 'true';
  const studentsRaw = fs.readFileSync(cohortFilePath, 'utf-8');
  const students: StudentRecord[] = JSON.parse(studentsRaw);

  const host = process.env.SES_HOST || process.env.SMTP_HOST || 'email-smtp.ap-south-1.amazonaws.com';
  const port = parseInt(process.env.SES_PORT || process.env.SMTP_PORT || '587', 10);
  const user = process.env.SES_USER || process.env.SMTP_USER;
  const pass = process.env.SES_PASS || process.env.SMTP_PASS;
  const fromEmail = process.env.SES_FROM || process.env.SMTP_FROM || 'TalentXcel Placements <admissions@talentxcel.in>';

  console.log(`================================================================`);
  console.log(`🚀 TALENTXCEL AMAZON SES DISPATCH ENGINE`);
  console.log(`================================================================`);
  console.log(`📋 Total Candidates in Savantis Cohort: ${students.length}`);
  console.log(`⚙️  Mode: ${isDryRun ? 'DRY-RUN / PREVIEW (Zero emails sent)' : 'LIVE DISPATCH VIA AMAZON SES'}`);

  if (isDryRun || !user || !pass) {
    console.log(`\n💡 To dispatch live via Amazon SES, set your credentials:`);
    console.log(`   $env:SES_HOST="email-smtp.ap-south-1.amazonaws.com"  # (or us-east-1)`);
    console.log(`   $env:SES_PORT="587"`);
    console.log(`   $env:SES_USER="<YOUR_SES_SMTP_USER>"`);
    console.log(`   $env:SES_PASS="<YOUR_SES_SMTP_PASSWORD>"`);
    console.log(`   $env:SES_FROM="TalentXcel Placements <admissions@talentxcel.in>"`);
    console.log(`   $env:SES_DISPATCH="true"`);
    console.log(`   npx tsx scripts/dispatch-savantis-ses.ts\n`);

    console.log(`🔍 Previewing Sample Email for Candidate 1:`);
    const sample = students[0];
    console.log(`   To: ${sample.name} <${sample.email}>`);
    console.log(`   College: ${sample.college} | Branch: ${sample.branch}`);
    console.log(`   Subject: ${sample.name}, check your ATS Resume Score for ${sample.college} campus placements (${sample.branch})`);
    console.log(`\n✅ Dry-Run Completed successfully for all ${students.length} candidates.`);
    return;
  }

  // Live SMTP Transport
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: {
      user,
      pass,
    },
  });

  console.log(`\n📡 Connected to Amazon SES (${host}). Beginning rate-limited dispatch...`);

  let sentCount = 0;
  let failCount = 0;

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const htmlContent = buildEmailHtml(student);
    const subject = `${student.name}, check your ATS Resume Score for ${student.college} campus placements (${student.branch})`;

    try {
      await transporter.sendMail({
        from: fromEmail,
        to: student.email,
        subject: subject,
        html: htmlContent,
      });

      sentCount++;
      console.log(`[${i + 1}/${students.length}] ✅ Sent to ${student.email} (${student.college})`);

      // Rate limit: 200ms delay between emails (~5 emails/sec to stay safely under SES quota)
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (err: any) {
      failCount++;
      console.error(`[${i + 1}/${students.length}] ❌ Failed to send to ${student.email}:`, err.message);
    }
  }

  console.log(`\n================================================================`);
  console.log(`🎉 CAMPAIGN DISPATCH COMPLETE`);
  console.log(`✅ Total Successfully Sent: ${sentCount}`);
  console.log(`❌ Total Failed: ${failCount}`);
  console.log(`================================================================`);
}

runCampaign().catch(console.error);
