// src/services/jobs/whatsappDigestGenerator.ts
// TalentXcel Zero-Cost WhatsApp Channel Digest Matching Engine
// Aggregates verified active jobs across Indian hubs, generates human-crafted WhatsApp broadcast drafts,
// and saves them to job_alert_campaigns for administrator review & manual 1-click publishing.

import { supabase } from '@/integrations/supabase/client';
import { getPublicJobUrl } from '@/lib/seo/canonicalUrls';

export interface GeneratedDigestResult {
  campaignId: string;
  campaignDate: string;
  title: string;
  messageText: string;
  jobCount: number;
  jobs: Array<{
    id: string;
    title: string;
    company_name: string;
    location: string;
    salary?: string;
    applyUrl: string;
  }>;
}

export async function generateWhatsAppDailyDigest(targetDate: string = new Date().toISOString().split('T')[0]): Promise<GeneratedDigestResult> {
  const channelUrl = (import.meta.env.VITE_WHATSAPP_CHANNEL_URL as string) || 'https://whatsapp.com/channel/0029VbDfu6Z1noz0UA2HYZ0o';

  // 1. Fetch unexpired, active, open verified jobs from jobs table
  const { data: rawJobs, error } = await supabase
    .from('jobs')
    .select('id, title, company_name, location, location_city, salary_min, salary_max, salary_currency, created_at, seo_slug, is_active, job_status, expires_at')
    .eq('is_active', true)
    .eq('job_status', 'open')
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !rawJobs || rawJobs.length === 0) {
    throw new Error(`Failed to query active jobs for WhatsApp digest: ${error?.message || 'Zero active jobs found'}`);
  }

  // 2. Deduplicate by title + company
  const seenKeys = new Set<string>();
  const uniqueJobs = rawJobs.filter(j => {
    const key = `${(j.title || '').toLowerCase()}|${(j.company_name || '').toLowerCase()}`;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });

  // 3. Group jobs by key Indian hubs
  const PRIORITY_HUBS = ['Varanasi', 'Noida', 'Delhi NCR', 'Bangalore', 'Pune', 'Hyderabad', 'Mumbai', 'Gurugram', 'Remote India'];
  const groupedJobs: Record<string, typeof uniqueJobs> = {};

  for (const hub of PRIORITY_HUBS) {
    groupedJobs[hub] = [];
  }
  groupedJobs['Other Verified Hubs'] = [];

  for (const job of uniqueJobs) {
    const loc = (job.location_city || job.location || '').toLowerCase();
    let placed = false;
    for (const hub of PRIORITY_HUBS) {
      if (loc.includes(hub.toLowerCase())) {
        if (groupedJobs[hub].length < 3) {
          groupedJobs[hub].push(job);
        }
        placed = true;
        break;
      }
    }
    if (!placed && groupedJobs['Other Verified Hubs'].length < 2) {
      groupedJobs['Other Verified Hubs'].push(job);
    }
  }

  // 4. Construct human-friendly, conversational WhatsApp broadcast text
  const now = new Date();
  const weekday = now.toLocaleDateString('en-IN', { weekday: 'long' });
  const dateFormatted = now.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  let message = `Hey everyone! ☀️ Happy ${weekday}!\n\n`;
  message += `Here is your daily batch of *verified, active job openings* released directly by top enterprise and tech teams across India today. Every role below has direct ATS application links with zero middleman or agency spam.\n\n`;

  const selectedDigestJobs: Array<{
    id: string;
    title: string;
    company_name: string;
    location: string;
    salary?: string;
    applyUrl: string;
  }> = [];

  let position = 1;

  for (const [hub, jobsInHub] of Object.entries(groupedJobs)) {
    if (jobsInHub.length === 0) continue;

    message += `📍 *${hub.toUpperCase()}*\n`;
    for (const job of jobsInHub) {
      const company = job.company_name || 'Verified Enterprise Partner';
      const applyUrl = getPublicJobUrl(job.seo_slug || job.id);
      
      let salaryStr = '';
      if (job.salary_min && job.salary_min > 0) {
        const curr = (job.salary_currency || 'INR').toUpperCase();
        if (curr === 'INR' && job.salary_min >= 100000) {
          salaryStr = ` (₹${(job.salary_min / 100000).toFixed(1)}L - ${(job.salary_max / 100000).toFixed(1)}L)`;
        } else if (curr === 'INR') {
          salaryStr = ` (₹${job.salary_min.toLocaleString('en-IN')})`;
        }
      }

      message += `• *${job.title}* – ${company}${salaryStr}\n`;
      message += `  👉 Direct Apply: ${applyUrl}\n`;

      selectedDigestJobs.push({
        id: job.id,
        title: job.title,
        company_name: company,
        location: hub,
        salary: salaryStr || undefined,
        applyUrl,
      });

      position++;
    }
    message += `\n`;
  }

  message += `---\n`;
  message += `🔍 *Looking for more roles, fresher openings, or different cities?*\n`;
  message += `Explore all 2,700+ live verified vacancies on both platforms:\n`;
  message += `🌐 Main Portal: https://talentxcel.in/jobs\n`;
  message += `⚡ Fast Jobs Hub: https://jobs.talentxcel.in/\n\n`;
  message += `💡 *Quick Tip:* Forward this update to friends or colleagues looking for their next career move. New verified openings drop every morning!\n\n`;
  message += `👉 Follow this channel for daily alerts: ${channelUrl}`;

  const campaignTitle = `Daily National Digest — ${dateFormatted}`;

  // 5. Save draft in job_alert_campaigns
  const { data: campaignRecord, error: campaignErr } = await supabase
    .from('job_alert_campaigns')
    .upsert({
      campaign_date: targetDate,
      title: campaignTitle,
      status: 'draft',
      message_text: message,
      job_count: selectedDigestJobs.length,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'campaign_date,title' })
    .select('id')
    .single();

  if (campaignErr) {
    console.error('Error saving campaign:', campaignErr);
  }

  const campaignId = campaignRecord?.id || `campaign-${Date.now()}`;

  // 6. Link selected jobs to campaign in job_alert_campaign_jobs
  if (campaignRecord?.id) {
    const jobLinkPayload = selectedDigestJobs.map((j, idx) => ({
      campaign_id: campaignRecord.id,
      job_id: j.id,
      position: idx + 1,
    }));

    await supabase
      .from('job_alert_campaign_jobs')
      .upsert(jobLinkPayload, { onConflict: 'campaign_id,job_id' })
      .catch((e) => console.warn('Warning linking campaign jobs:', e));
  }

  return {
    campaignId,
    campaignDate: targetDate,
    title: campaignTitle,
    messageText: message,
    jobCount: selectedDigestJobs.length,
    jobs: selectedDigestJobs,
  };
}
