// src/services/distribution/distributionEngine.ts
// TalentXcel Autonomous Distribution OS — Universal Content & Distribution Service

import { supabase } from '@/integrations/supabase/client';

export type DistributionCategory = 
  | 'tech_high_growth'
  | 'fresher_entry'
  | 'city_spotlight'
  | 'remote_executive'
  | 'govt_psu'
  | 'non_it_business';

export interface EligibleJob {
  id: string;
  job_title: string;
  company_name: string;
  location: string | null;
  location_city: string | null;
  location_state: string | null;
  experience_level: string | null;
  salary_range: string | null;
  salary_min: number | null;
  salary_max: number | null;
  external_url: string | null;
  seo_slug: string | null;
  is_remote: boolean;
  is_government_job: boolean;
  posted_at: string | null;
  match_score: number;
}

export interface GeneratedPost {
  category: DistributionCategory;
  slot_time: string;
  title: string;
  telegramHtml: string;
  whatsappText: string;
  jobs: EligibleJob[];
  idempotencyKey: string;
}

export const CATEGORY_LABELS: Record<DistributionCategory, { name: string; subtitle: string; emoji: string }> = {
  tech_high_growth: {
    name: 'Tech & High-Growth Opportunities',
    subtitle: 'Verified Engineering, AI, Data & Product Roles',
    emoji: '⚡'
  },
  fresher_entry: {
    name: 'Fresher & Early Career Openings',
    subtitle: 'Entry-Level Roles, Graduate Positions & Internships',
    emoji: '🎓'
  },
  city_spotlight: {
    name: 'Metro & Regional Hiring Spotlight',
    subtitle: 'Top Enterprise & Hub Openings Across India',
    emoji: '📍'
  },
  remote_executive: {
    name: 'Remote & Leadership Hiring Alert',
    subtitle: 'Work-from-Home & Senior Leadership Vacancies',
    emoji: '🌐'
  },
  govt_psu: {
    name: 'Government & Public Sector Openings',
    subtitle: 'Verified Public Enterprise & Government Roles',
    emoji: '🏛️'
  },
  non_it_business: {
    name: 'Business, Finance & Operations Careers',
    subtitle: 'Sales, Management, HR, Legal & Operations Roles',
    emoji: '💼'
  }
};

export const SCHEDULE_SLOTS = [
  { slot: '08:00_IST', label: '08:00 AM IST (Morning Tech & Enterprise)', defaultCategory: 'tech_high_growth' as DistributionCategory },
  { slot: '12:00_IST', label: '12:00 PM IST (Midday Fresher & Entry-Level)', defaultCategory: 'fresher_entry' as DistributionCategory },
  { slot: '16:00_IST', label: '04:00 PM IST (Afternoon Metro & City Spotlight)', defaultCategory: 'city_spotlight' as DistributionCategory },
  { slot: '20:00_IST', label: '08:00 PM IST (Evening Remote & Leadership Roles)', defaultCategory: 'remote_executive' as DistributionCategory }
];

function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getApplyUrl(job: EligibleJob): string {
  if (job.external_url && job.external_url.startsWith('http')) {
    return job.external_url;
  }
  const slug = job.seo_slug || job.id;
  return `https://talentxcel.in/jobs/${slug}`;
}

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
 * Fetches eligible jobs using the live PostgreSQL RPC function
 */
export async function fetchEligibleJobs(
  category: DistributionCategory,
  limit: number = 5,
  excludeIds: string[] = []
): Promise<EligibleJob[]> {
  const { data, error } = await supabase.rpc('get_distribution_eligible_jobs', {
    p_category: category,
    p_limit: limit,
    p_exclude_ids: excludeIds
  });

  if (error) {
    console.error('Error fetching distribution eligible jobs:', error);
    throw error;
  }

  return (data || []) as EligibleJob[];
}

/**
 * Builds formatted post content for Telegram HTML and WhatsApp markdown
 */
export function generateDistributionPostContent(
  category: DistributionCategory,
  slotTime: string,
  jobs: EligibleJob[]
): GeneratedPost {
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const meta = CATEGORY_LABELS[category] || CATEGORY_LABELS.tech_high_growth;
  const grouped = groupJobsByLocation(jobs);

  const portalUrl = 'https://talentxcel.in/jobs';
  const jobsUrl = 'https://jobs.talentxcel.in';
  const tgInvite = 'https://t.me/TalentXcelJobs';
  const waInvite = 'https://whatsapp.com/channel/0029VbDfu6Z1noz0UA2HYZ0o';

  // 1. Telegram HTML
  const tgLines: string[] = [];
  tgLines.push(`${meta.emoji} <b>TalentXcel Jobs • ${escapeHtml(meta.name)}</b>`);
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

  // 2. WhatsApp Markdown
  const waLines: string[] = [];
  waLines.push(`🔔 *TalentXcel Jobs • ${meta.name}*`);
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
  const todayIso = new Date().toISOString().split('T')[0];
  const idempotencyKey = `txc_dist_${todayIso}_${slotTime}_${category}`;

  return {
    category,
    slot_time: slotTime,
    title: `${meta.name} — ${dateStr}`,
    telegramHtml,
    whatsappText,
    jobs,
    idempotencyKey
  };
}

/**
 * Triggers dry-run or live post via Cloudflare Worker
 */
export async function triggerWorkerPublish(params: {
  category: DistributionCategory;
  slot: string;
  channel?: 'telegram' | 'whatsapp';
  dryRun?: boolean;
}): Promise<any> {
  const workerEndpoint = 'https://talentxcel-telegram-publisher.arsh-wani.workers.dev/publish';

  const res = await fetch(workerEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  return res.json();
}
