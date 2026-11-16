import { EligibleJob, DistributionCategory, GeneratedPost } from './types';
import { escapeHtml } from './telegram';

function formatDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
}

function getCategoryMeta(category: DistributionCategory): { title: string; subtitle: string; emoji: string } {
  switch (category) {
    case 'tech_high_growth':
      return {
        title: 'Tech & High-Growth Opportunities',
        subtitle: 'Verified Engineering, AI, Data & Product Roles',
        emoji: '⚡'
      };
    case 'fresher_entry':
      return {
        title: 'Fresher & Early Career Openings',
        subtitle: 'Entry-Level Roles, Graduate Positions & Internships',
        emoji: '🎓'
      };
    case 'city_spotlight':
      return {
        title: 'Metro & Regional Hiring Spotlight',
        subtitle: 'Top Enterprise & Hub Openings Across India',
        emoji: '📍'
      };
    case 'remote_executive':
      return {
        title: 'Remote & Leadership Hiring Alert',
        subtitle: 'Work-from-Home & Senior Leadership Vacancies',
        emoji: '🌐'
      };
    case 'govt_psu':
      return {
        title: 'Government & Public Sector Openings',
        subtitle: 'Verified Public Enterprise & Government Roles',
        emoji: '🏛️'
      };
    case 'non_it_business':
      return {
        title: 'Business, Finance & Operations Careers',
        subtitle: 'Sales, Management, HR, Legal & Operations Roles',
        emoji: '💼'
      };
    default:
      return {
        title: 'Daily Verified Career Openings',
        subtitle: 'Free Direct ATS & Portal Applications',
        emoji: '🔔'
      };
  }
}

/**
 * Builds the canonical apply URL.
 * If external_url is present, it returns it; otherwise routes to canonical TalentXcel job detail page.
 */
function getApplyUrl(job: EligibleJob, basePortalUrl: string = 'https://talentxcel.in'): string {
  if (job.external_url && job.external_url.startsWith('http')) {
    return job.external_url;
  }
  const slug = job.seo_slug || job.id;
  return `${basePortalUrl.replace(/\/+$/, '')}/jobs/${slug}`;
}

/**
 * Formats clean compensation string.
 */
function formatCompensation(job: EligibleJob): string | null {
  if (job.salary_range && job.salary_range.trim().length > 2) {
    return job.salary_range.trim();
  }
  if (job.salary_min && job.salary_max && job.salary_min > 0) {
    const minLakhs = (job.salary_min / 100000).toFixed(1);
    const maxLakhs = (job.salary_max / 100000).toFixed(1);
    return `₹${minLakhs}L - ₹${maxLakhs}L PA`;
  }
  return null;
}

/**
 * Deterministically groups jobs by City for geographic clarity.
 */
function groupJobsByLocation(jobs: EligibleJob[]): Map<string, EligibleJob[]> {
  const map = new Map<string, EligibleJob[]>();
  for (const job of jobs) {
    const city = job.is_remote
      ? 'REMOTE / PAN-INDIA'
      : (job.location_city || job.location || 'PAN-INDIA').toUpperCase();
    if (!map.has(city)) {
      map.set(city, []);
    }
    map.get(city)!.push(job);
  }
  return map;
}

/**
 * Generates both Telegram HTML and WhatsApp Channel Markdown for a given category & jobs set.
 */
export function buildDistributionPost(
  category: DistributionCategory,
  slotTime: string,
  jobs: EligibleJob[],
  config: {
    portalUrl?: string;
    jobsSubdomainUrl?: string;
    telegramInviteUrl?: string;
    whatsappChannelUrl?: string;
  } = {}
): GeneratedPost {
  const portalUrl = config.portalUrl || 'https://talentxcel.in/jobs';
  const jobsUrl = config.jobsSubdomainUrl || 'https://jobs.talentxcel.in';
  const tgInvite = config.telegramInviteUrl || 'https://t.me/TalentXcelJobs';
  const waInvite = config.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VbDfu6Z1noz0UA2HYZ0o';

  const dateStr = formatDate();
  const meta = getCategoryMeta(category);
  const grouped = groupJobsByLocation(jobs);

  // 1. Build Telegram HTML Post
  const tgLines: string[] = [];
  tgLines.push(`${meta.emoji} <b>TalentXcel Jobs • ${escapeHtml(meta.title)}</b>`);
  tgLines.push(`📅 <i>${escapeHtml(dateStr)} • ${escapeHtml(meta.subtitle)}</i>\n`);
  tgLines.push(`Here are direct verified career vacancies open today across India:\n`);

  for (const [locationKey, locJobs] of grouped.entries()) {
    tgLines.push(`📍 <b>${escapeHtml(locationKey)}</b>`);
    for (const job of locJobs) {
      const applyUrl = getApplyUrl(job);
      const comp = formatCompensation(job);
      const compStr = comp ? ` (<code>${escapeHtml(comp)}</code>)` : '';
      tgLines.push(`• <b>${escapeHtml(job.job_title)}</b> — <i>${escapeHtml(job.company_name)}</i>${compStr}`);
      tgLines.push(`  👉 <a href="${escapeHtml(applyUrl)}">Apply Directly on TalentXcel / ATS</a>`);
    }
    tgLines.push('');
  }

  tgLines.push(`🌐 <b>Explore 2,700+ more verified live roles:</b>`);
  tgLines.push(`<a href="${escapeHtml(portalUrl)}">${escapeHtml(portalUrl)}</a>`);
  tgLines.push(`<a href="${escapeHtml(jobsUrl)}">${escapeHtml(jobsUrl)}</a>\n`);
  tgLines.push(`📲 <i>Follow our official channels for real-time daily hiring alerts:</i>`);
  tgLines.push(`• Telegram: <a href="${escapeHtml(tgInvite)}">Join TalentXcel Jobs</a>`);
  tgLines.push(`• WhatsApp: <a href="${escapeHtml(waInvite)}">Follow WhatsApp Channel</a>\n`);
  tgLines.push(`<b>GET DISCOVERED. GET HIRED.</b>`);

  const telegramHtml = tgLines.join('\n');

  // 2. Build WhatsApp Markdown Post
  const waLines: string[] = [];
  waLines.push(`🔔 *TalentXcel Jobs • ${meta.title}*`);
  waLines.push(`📅 ${dateStr} · ${meta.subtitle}\n`);
  waLines.push(`Here are direct verified career vacancies open today across India:\n`);

  for (const [locationKey, locJobs] of grouped.entries()) {
    waLines.push(`📍 *${locationKey}*`);
    for (const job of locJobs) {
      const applyUrl = getApplyUrl(job);
      const comp = formatCompensation(job);
      const compStr = comp ? ` (${comp})` : '';
      waLines.push(`• *${job.job_title}* – ${job.company_name}${compStr}`);
      waLines.push(`  👉 Apply: ${applyUrl}`);
    }
    waLines.push('');
  }

  waLines.push(`🌐 *Explore 2,700+ more verified live roles:*`);
  waLines.push(`${portalUrl}`);
  waLines.push(`${jobsUrl}\n`);
  waLines.push(`Follow *TalentXcel Jobs* for free daily career opportunities. Unfollow anytime directly in WhatsApp.`);
  waLines.push(`${waInvite}\n`);
  waLines.push(`*GET DISCOVERED. GET HIRED.*`);

  const whatsappText = waLines.join('\n');

  // Deterministic Idempotency Key (YYYY-MM-DD + slot + category)
  const todayIso = new Date().toISOString().split('T')[0];
  const idempotencyKey = `txc_dist_${todayIso}_${slotTime}_${category}`;

  return {
    category,
    slot_time: slotTime,
    title: `${meta.title} — ${dateStr}`,
    telegramHtml,
    whatsappText,
    jobs,
    idempotencyKey
  };
}
