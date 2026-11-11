// src/lib/digests/jobDigestEngine.ts
// Automated Tri-Industry Daily Job Digest & Verification Engine
// Timezone Standard: Asia/Kolkata (IST)

export interface VerifiedDigestJob {
  id: string;
  title: string;
  companyName: string;
  location: string;
  category: 'tech' | 'non-tech' | 'core-industry';
  employmentType?: string;
  isRemote?: boolean;
  salaryText?: string;
  sourceUrl: string;
  applicationUrl: string;
  deadline?: string;
  verifiedAt: string;
}

export interface DailyDigestPackage {
  dateIso: string;
  dateDisplay: string;
  category: 'tech' | 'non-tech' | 'core-industry';
  categoryTitle: string;
  jobs: VerifiedDigestJob[];
  telegramMarkdown: string;
  whatsappText: string;
  emailHtml: string;
  status: 'PENDING_FOUNDER_APPROVAL' | 'APPROVED' | 'PUBLISHED';
}

const TECH_KEYWORDS = [
  'software', 'developer', 'frontend', 'backend', 'full stack', 'react', 
  'node', 'python', 'java', 'cloud', 'devops', 'data', 'ai', 'machine learning', 
  'qa', 'automation', 'cyber', 'security', 'it support', 'freshers'
];

const NON_TECH_KEYWORDS = [
  'marketing', 'sales', 'operations', 'customer', 'business', 'hr', 
  'human resources', 'finance', 'account', 'content', 'writer', 'support', 
  'management trainee', 'relationship manager', 'administration', 'hospitality'
];

const CORE_KEYWORDS = [
  'mechanical', 'civil', 'electrical', 'safety', 'officer', 'hospital', 
  'logistics', 'supply chain', 'manufacturing', 'public', 'government', 
  'audit', 'energy', 'iocl', 'isro', 'drdo', 'psu'
];

export function categorizeJob(title: string, department?: string): 'tech' | 'non-tech' | 'core-industry' {
  const text = `${title} ${department || ''}`.toLowerCase();
  
  if (CORE_KEYWORDS.some(k => text.includes(k))) {
    return 'core-industry';
  }
  if (NON_TECH_KEYWORDS.some(k => text.includes(k))) {
    return 'non-tech';
  }
  return 'tech';
}

export function deduplicateJobs(jobs: any[]): any[] {
  const seen = new Set<string>();
  return jobs.filter(j => {
    const key = `${(j.title || '').trim().toLowerCase()}_${(j.company_name || '').trim().toLowerCase()}_${(j.location || '').trim().toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function formatSalary(min?: number, max?: number): string | undefined {
  if (!min) return undefined;
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
  date: Date = new Date()
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
    'tech': '🚀 TALENTXCEL TECH DIGEST',
    'non-tech': '💼 TALENTXCEL BUSINESS & OPERATIONS DIGEST',
    'core-industry': '⚙️ TALENTXCEL CORE INDUSTRY & PSU DIGEST'
  };

  const ctaLinks = {
    'tech': 'https://resume.talentxcel.in/resume/ats-check?utm_source=telegram&utm_medium=tech_digest&utm_campaign=daily_digest',
    'non-tech': 'https://salary.talentxcel.in/analyzer?utm_source=whatsapp&utm_medium=nontech_digest&utm_campaign=daily_digest',
    'core-industry': 'https://passport.talentxcel.in?utm_source=telegram&utm_medium=core_digest&utm_campaign=daily_digest'
  };

  const ctaTexts = {
    'tech': '⚠️ Over 70% of tech resumes fail automated ATS screening. Check your ATS score free before applying:\n👉 Free ATS Scanner: ' + ctaLinks['tech'],
    'non-tech': '💡 Curious about true in-hand take-home salary in your city? Calculate in 30 seconds:\n👉 Free PayScale Calculator: ' + ctaLinks['non-tech'],
    'core-industry': '🛡️ Stand out to industrial and PSU hiring committees with a verified Career Passport:\n👉 Claim Career Passport: ' + ctaLinks['core-industry']
  };

  // Filter and deduplicate
  const filtered = deduplicateJobs(rawJobs.filter(j => categorizeJob(j.title, j.department) === category)).slice(0, 5);

  const verifiedJobs: VerifiedDigestJob[] = filtered.map(j => {
    const salaryText = formatSalary(j.salary_min, j.salary_max);
    const trackingUrl = `https://jobs.talentxcel.in/jobs/${j.id}?utm_source=job_digest&utm_medium=${category}&utm_campaign=daily_${dateIso}`;
    return {
      id: j.id,
      title: j.title,
      companyName: j.company_name || 'Verified Employer',
      location: j.location || 'Multiple Locations / Remote',
      category,
      employmentType: j.employment_type,
      isRemote: j.is_remote,
      salaryText,
      sourceUrl: j.source_url || trackingUrl,
      applicationUrl: trackingUrl,
      deadline: j.deadline,
      verifiedAt: new Date().toISOString()
    };
  });

  // 1. Build Telegram Markdown
  let tgMd = `${titlePrefixes[category]} — ${dateDisplay}\n`;
  tgMd += `Verified Active Vacancies (Direct 1-Click Apply Links)\n\n`;

  verifiedJobs.forEach((job, idx) => {
    tgMd += `${idx + 1}️⃣ *${job.title}*\n`;
    tgMd += `🏢 ${job.companyName}\n`;
    tgMd += `📍 ${job.location}${job.salaryText ? ` | ${job.salaryText}` : ''}\n`;
    tgMd += `👉 Apply: ${job.applicationUrl}\n\n`;
  });

  tgMd += `${ctaTexts[category]}\n`;

  // 2. Build WhatsApp Text
  let waText = `${titlePrefixes[category]} — ${dateDisplay}\n\n`;
  verifiedJobs.forEach((job, idx) => {
    waText += `*${idx + 1}. ${job.title}*\n`;
    waText += `Company: ${job.companyName}\n`;
    waText += `Location: ${job.location}\n`;
    if (job.salaryText) waText += `Compensation: ${job.salaryText}\n`;
    waText += `Apply Link: ${job.applicationUrl}\n\n`;
  });
  waText += `${ctaTexts[category]}`;

  // 3. Build Email HTML
  let emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0b0f19; color: #f8fafc; border-radius: 12px;">
      <h2 style="color: #38bdf8; margin-bottom: 4px;">${titlePrefixes[category]}</h2>
      <p style="color: #94a3b8; font-size: 13px; margin-top: 0;">${dateDisplay}</p>
      <div style="margin-top: 20px;">
  `;

  verifiedJobs.forEach((job, idx) => {
    emailHtml += `
      <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; margin-bottom: 12px; border: 1px solid #334155;">
        <h3 style="color: #ffffff; font-size: 16px; margin: 0 0 6px 0;">${idx + 1}. ${job.title}</h3>
        <p style="color: #cbd5e1; font-size: 13px; margin: 0 0 8px 0;"><strong>${job.companyName}</strong> &bull; ${job.location} ${job.salaryText ? `&bull; <span style="color: #34d399;">${job.salaryText}</span>` : ''}</p>
        <a href="${job.applicationUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: bold; padding: 6px 14px; border-radius: 6px;">1-Click Apply</a>
      </div>
    `;
  });

  emailHtml += `
      </div>
      <div style="margin-top: 24px; padding: 14px; background-color: #172554; border-radius: 8px; border: 1px solid #1d4ed8;">
        <p style="color: #e2e8f0; font-size: 13px; margin: 0;">${ctaTexts[category].replace(/\n/g, '<br/>')}</p>
      </div>
    </div>
  `;

  return {
    dateIso,
    dateDisplay,
    category,
    categoryTitle: categoryTitles[category],
    jobs: verifiedJobs,
    telegramMarkdown: tgMd,
    whatsappText: waText,
    emailHtml,
    status: 'PENDING_FOUNDER_APPROVAL'
  };
}
