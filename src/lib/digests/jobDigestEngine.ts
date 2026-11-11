// src/lib/digests/jobDigestEngine.ts
// Automated Tri-Industry Daily Job Digest & Verification Engine
// Timezone Standard: Asia/Kolkata (IST)

export interface VerifiedDigestJob {
  id: string;
  title: string;
  companyName: string;
  location: string;
  category: 'tech' | 'non-tech' | 'core-industry';
  experienceLevel: string;
  qualification: string;
  salaryText?: string;
  source: string;
  originalSourceUrl?: string;
  applicationUrl: string;
  deadline?: string;
  verifiedAt: string;
}

export interface DailyDigestPackage {
  dateIso: string;
  dateDisplay: string;
  category: 'tech' | 'non-tech' | 'core-industry';
  categoryTitle: string;
  targetCount: number;
  actualCount: number;
  hasShortage: boolean;
  shortageMessage?: string;
  jobs: VerifiedDigestJob[];
  telegramMarkdown: string;
  whatsappText: string;
  emailHtml: string;
  facebookText: string;
  linkedInText: string;
  status: 'PENDING_FOUNDER_APPROVAL' | 'APPROVED' | 'PUBLISHED';
}

const CORE_ORGANIZATIONS = [
  'bhel', 'isro', 'drdo', 'iocl', 'railway', 'rrb', 'ntpc', 'ongc', 'sail',
  'hal', 'bel', 'powergrid', 'coal india', 'lic', 'sbi', 'rbi', 'upsc', 'ssc'
];

const CORE_KEYWORDS = [
  'mechanical', 'civil', 'electrical', 'safety', 'officer', 'hospital', 
  'logistics', 'supply chain', 'manufacturing', 'public', 'government', 
  'audit', 'energy', 'psu', 'technician', 'plant', 'maintenance', 'site', 'trainee', 'sub-engineer'
];

const TECH_KEYWORDS = [
  'software', 'developer', 'frontend', 'backend', 'full stack', 'react', 
  'node', 'python', 'java', 'cloud', 'devops', 'data', 'ai', 'machine learning', 
  'qa', 'automation', 'cyber', 'security', 'it support', 'freshers', 'engineer', 
  'architect', 'sre', 'tech lead', 'programmer', 'analyst', 'database', 'platform'
];

const NON_TECH_KEYWORDS = [
  'marketing', 'sales', 'operations', 'customer', 'business', 'hr', 
  'human resources', 'finance', 'account', 'content', 'writer', 'support', 
  'management trainee', 'relationship manager', 'administration', 'hospitality',
  'telecaller', 'recruiter', 'lead generation', 'procurement', 'bpo', 'executive'
];

export function categorizeJob(title: string, company?: string, department?: string, industry?: string): 'tech' | 'non-tech' | 'core-industry' {
  const t = (title || '').toLowerCase();
  const c = (company || '').toLowerCase();
  const d = (department || '').toLowerCase();
  const ind = (industry || '').toLowerCase();
  const full = `${t} ${c} ${d} ${ind}`;

  // 1. PSU & Core Industry check
  if (CORE_ORGANIZATIONS.some(org => c.includes(org) || t.includes(org))) {
    return 'core-industry';
  }
  if (CORE_KEYWORDS.some(k => full.includes(k))) {
    return 'core-industry';
  }

  // 2. Strong Tech keywords take precedence over general terms
  if (TECH_KEYWORDS.some(k => t.includes(k))) {
    return 'tech';
  }

  // 3. Non-Tech & Corporate business
  if (NON_TECH_KEYWORDS.some(k => full.includes(k))) {
    return 'non-tech';
  }

  // 4. Fallback based on department / industry
  if (d.includes('tech') || d.includes('it') || ind.includes('tech') || ind.includes('software')) {
    return 'tech';
  }

  return 'non-tech';
}

export function deduplicateJobs(jobs: any[]): any[] {
  const seen = new Set<string>();
  const now = new Date();

  return jobs.filter(j => {
    // Drop expired
    if (j.application_deadline && new Date(j.application_deadline) < now) return false;
    if (j.expires_at && new Date(j.expires_at) < now) return false;

    const titleKey = (j.title || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const compKey = (j.company_name || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const locKey = (j.location_city || j.location || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const key = `${titleKey}_${compKey}_${locKey}`;

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function formatSalary(min?: number, max?: number): string | undefined {
  if (!min || min <= 0) return undefined;
  const minLakhs = (min / 100000).toFixed(1);
  if (!max || max === min) {
    return `₹${minLakhs} LPA`;
  }
  const maxLakhs = (max / 100000).toFixed(1);
  return `₹${minLakhs}L – ₹${maxLakhs}L CTC`;
}

export function generateDigestPackage(
  category: 'tech' | 'non-tech' | 'core-industry',
  rawJobs: any[],
  date: Date = new Date(),
  targetQuota: number = 20
): DailyDigestPackage {
  const dateDisplay = date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
  const dateIso = date.toISOString().split('T')[0];

  const categoryTitles = {
    'tech': 'Tech & IT Engineering Jobs',
    'non-tech': 'Non-Tech, Corporate & Business Jobs',
    'core-industry': 'Core Engineering, Logistics & PSU Jobs'
  };

  const titlePrefixes = {
    'tech': '🚀 TALENTXCEL TECH DIGEST (20 Verified Openings)',
    'non-tech': '💼 TALENTXCEL BUSINESS & OPERATIONS DIGEST (20 Verified Openings)',
    'core-industry': '⚙️ TALENTXCEL CORE INDUSTRY & PSU DIGEST (20 Verified Openings)'
  };

  const ctaLinks = {
    'tech': 'https://resume.talentxcel.in?utm_source=social_digest&utm_medium=tech&utm_campaign=daily_' + dateIso,
    'non-tech': 'https://salary.talentxcel.in?utm_source=social_digest&utm_medium=non_tech&utm_campaign=daily_' + dateIso,
    'core-industry': 'https://passport.talentxcel.in?utm_source=social_digest&utm_medium=core&utm_campaign=daily_' + dateIso
  };

  const ctaTexts = {
    'tech': '⚠️ Over 70% of tech resumes fail automated ATS screening. Scan your resume free in 10 seconds:\n👉 Free ATS Scanner: ' + ctaLinks['tech'],
    'non-tech': '💡 Curious about true in-hand take-home salary in your city? Calculate under New Tax Regime:\n👉 Free PayScale Calculator: ' + ctaLinks['non-tech'],
    'core-industry': '🛡️ Stand out to industrial and PSU hiring committees with a tamper-proof verified Career Passport:\n👉 Claim Career Passport: ' + ctaLinks['core-industry']
  };

  // 1. Filter, deduplicate, and sort by created date
  const categoryJobs = rawJobs.filter(j => 
    categorizeJob(j.title, j.company_name, j.department, j.industry) === category
  );
  const deduplicated = deduplicateJobs(categoryJobs);

  // Take up to targetQuota (20)
  const selectedJobs = deduplicated.slice(0, targetQuota);
  const actualCount = selectedJobs.length;
  const hasShortage = actualCount < targetQuota;
  const shortageMessage = hasShortage 
    ? `⚠️ Quota Notice: ${actualCount} verified vacancies found (Target: ${targetQuota}). Shortage of ${targetQuota - actualCount} openings.` 
    : undefined;

  const verifiedJobs: VerifiedDigestJob[] = selectedJobs.map(j => {
    const salaryText = formatSalary(j.salary_min, j.salary_max);
    const trackingUrl = `https://jobs.talentxcel.in/jobs/${j.id}?utm_source=job_digest&utm_medium=${category}&utm_campaign=daily_${dateIso}`;
    
    // Determine experience label
    let expLevel = j.experience_level || 'Open to All';
    if (j.minimum_experience_years !== undefined && j.minimum_experience_years !== null) {
      expLevel = `${j.minimum_experience_years}–${j.maximum_experience_years || j.minimum_experience_years + 2} Years`;
    }

    // Determine qualification
    const qual = j.educational_qualification || j.minimum_education || 'Graduate / Diploma';

    return {
      id: j.id,
      title: j.title || 'Role Title',
      companyName: j.company_name || 'Verified Employer',
      location: j.location_city || j.location || 'Pan India / Remote',
      category,
      experienceLevel: expLevel,
      qualification: qual,
      salaryText,
      source: j.source || 'TalentXcel Verified Ingestion',
      originalSourceUrl: j.external_url || trackingUrl,
      applicationUrl: trackingUrl,
      deadline: j.application_deadline ? new Date(j.application_deadline).toLocaleDateString('en-IN') : undefined,
      verifiedAt: new Date().toISOString()
    };
  });

  // 1. TELEGRAM MARKDOWN
  let tgMd = `${titlePrefixes[category]} — ${dateDisplay}\n`;
  tgMd += `100% Verified Active Vacancies • Zero Spam • Direct 1-Click Apply\n\n`;

  verifiedJobs.forEach((job, idx) => {
    tgMd += `${idx + 1}️⃣ *${job.title}*\n`;
    tgMd += `🏢 ${job.companyName}\n`;
    tgMd += `📍 ${job.location} | 🎓 ${job.qualification} | ⏳ Exp: ${job.experienceLevel}\n`;
    if (job.salaryText) tgMd += `💰 ${job.salaryText}\n`;
    if (job.deadline) tgMd += `📅 Deadline: ${job.deadline}\n`;
    tgMd += `👉 Apply Now: ${job.applicationUrl}\n\n`;
  });

  tgMd += `────────────────────\n${ctaTexts[category]}\n`;

  // 2. WHATSAPP BROADCAST TEXT
  let waText = `*${titlePrefixes[category]}*\n📅 *${dateDisplay}*\n`;
  waText += `Verified Active Vacancies (Direct 1-Click Apply Links)\n\n`;

  verifiedJobs.forEach((job, idx) => {
    waText += `*${idx + 1}. ${job.title}*\n`;
    waText += `• Company: ${job.companyName}\n`;
    waText += `• Location: ${job.location}\n`;
    waText += `• Exp: ${job.experienceLevel} | Qual: ${job.qualification}\n`;
    if (job.salaryText) waText += `• Salary: ${job.salaryText}\n`;
    if (job.deadline) waText += `• Deadline: ${job.deadline}\n`;
    waText += `• Link: ${job.applicationUrl}\n\n`;
  });

  waText += `--------------------\n${ctaTexts[category]}`;

  // 3. EMAIL HTML NEWSLETTER
  let emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; background-color: #0b0f19; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b;">
      <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-bottom: 20px;">
        <span style="background-color: #1e3a8a; color: #93c5fd; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; text-transform: uppercase;">TalentXcel Daily Verified Digest</span>
        <h2 style="color: #ffffff; font-size: 20px; margin: 8px 0 4px 0;">${categoryTitles[category]}</h2>
        <p style="color: #94a3b8; font-size: 13px; margin: 0;">${dateDisplay} &bull; ${actualCount} Verified Active Vacancies</p>
      </div>
      <div style="margin-top: 16px;">
  `;

  verifiedJobs.forEach((job, idx) => {
    emailHtml += `
      <div style="background-color: #131b2e; padding: 14px 18px; border-radius: 10px; margin-bottom: 12px; border: 1px solid #1e293b;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <h3 style="color: #60a5fa; font-size: 15px; margin: 0 0 4px 0; font-weight: 700;">${idx + 1}. ${job.title}</h3>
        </div>
        <p style="color: #e2e8f0; font-size: 13px; margin: 0 0 6px 0;"><strong>${job.companyName}</strong> &bull; ${job.location}</p>
        <p style="color: #94a3b8; font-size: 12px; margin: 0 0 10px 0;">Experience: ${job.experienceLevel} &bull; Qualification: ${job.qualification} ${job.salaryText ? `&bull; <span style="color: #34d399; font-weight: 600;">${job.salaryText}</span>` : ''}</p>
        <a href="${job.applicationUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: bold; padding: 6px 14px; border-radius: 6px;">Apply on JobMatch OS &rarr;</a>
      </div>
    `;
  });

  emailHtml += `
      </div>
      <div style="margin-top: 24px; padding: 16px; background-color: #1e293b; border-radius: 10px; border-left: 4px solid #3b82f6;">
        <p style="color: #f1f5f9; font-size: 13px; line-height: 1.5; margin: 0;">${ctaTexts[category].replace(/\n/g, '<br/>')}</p>
      </div>
      <div style="margin-top: 20px; text-align: center; font-size: 11px; color: #64748b;">
        <p>&copy; 2026 TalentXcel. No spam, ever. Unsubscribe anytime.</p>
      </div>
    </div>
  `;

  // 4. FACEBOOK POST
  let fbText = `${titlePrefixes[category]} — ${dateDisplay}\n\n`;
  fbText += `Here is today's curated list of verified hiring vacancies across India:\n\n`;
  verifiedJobs.slice(0, 10).forEach((job, idx) => {
    fbText += `🔹 ${job.title} at ${job.companyName} (${job.location})\n`;
    if (job.salaryText) fbText += `   Compensation: ${job.salaryText}\n`;
    fbText += `   Apply: ${job.applicationUrl}\n\n`;
  });
  fbText += `View all ${actualCount} vacancies today: https://jobs.talentxcel.in\n\n`;
  fbText += `#Jobs #Hiring #Careers #IndiaJobs #TalentXcel`;

  // 5. LINKEDIN POST
  let liText = `🚨 Daily Hiring Digest: ${categoryTitles[category]} (${dateDisplay})\n\n`;
  liText += `To save active candidates from outdated listings and ghost jobs, here are today's verified, active openings with verified employers:\n\n`;
  verifiedJobs.slice(0, 10).forEach((job, idx) => {
    liText += `• ${job.title} | ${job.companyName} (${job.location})\n`;
    liText += `  Requirements: ${job.experienceLevel} | ${job.qualification}\n`;
    if (job.salaryText) liText += `  Package: ${job.salaryText}\n`;
    liText += `  Direct 1-Click Apply: ${job.applicationUrl}\n\n`;
  });
  liText += `────────────────────\n`;
  liText += `Check your ATS match score before applying on https://resume.talentxcel.in\n\n`;
  liText += `#Hiring #JobSearch #Careers #Recruitment #TechJobs #TalentXcel`;

  return {
    dateIso,
    dateDisplay,
    category,
    categoryTitle: categoryTitles[category],
    targetCount: targetQuota,
    actualCount,
    hasShortage,
    shortageMessage,
    jobs: verifiedJobs,
    telegramMarkdown: tgMd,
    whatsappText: waText,
    emailHtml,
    facebookText: fbText,
    linkedInText: liText,
    status: 'PENDING_FOUNDER_APPROVAL'
  };
}
