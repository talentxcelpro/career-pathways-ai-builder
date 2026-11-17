// scripts/generate-whatsapp-digest.ts
// CLI / Cron executor for TalentXcel Zero-Cost WhatsApp Digest Matching Engine

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

let serviceKey = '';
let supabaseUrl = '';

const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('TALENTXCEL_SERVICE_ROLE_KEY=')) {
      serviceKey = trimmed.split('=')[1].trim().replace(/^['"]|['"]$/g, '');
    }
    if (trimmed.startsWith('TX_SUPABASE_URL=')) {
      supabaseUrl = trimmed.split('=')[1].trim().replace(/^['"]|['"]$/g, '');
    }
  }
}

const finalUrl = supabaseUrl || process.env.VITE_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const finalKey = serviceKey || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const channelUrl = process.env.VITE_WHATSAPP_CHANNEL_URL || 'https://whatsapp.com/channel/0029VbDfu6Z1noz0UA2HYZ0o';
const supabase = createClient(finalUrl, finalKey);

async function run() {
  console.log('--- GENERATING TALENTXCEL WHATSAPP CHANNEL DIGEST (HUMAN-CURATED) ---');
  const targetDate = new Date().toISOString().split('T')[0];

  const { data: rawJobs, error } = await supabase
    .from('jobs')
    .select('id, title, company_name, location, location_city, salary_min, salary_max, salary_currency, created_at, seo_slug, is_active, job_status, expires_at')
    .eq('is_active', true)
    .eq('job_status', 'open')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !rawJobs || rawJobs.length === 0) {
    console.error('Error fetching jobs:', error);
    process.exit(1);
  }

  // Deduplicate
  const seenKeys = new Set<string>();
  const uniqueJobs = rawJobs.filter(j => {
    const key = `${(j.title || '').toLowerCase()}|${(j.company_name || '').toLowerCase()}`;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });

  const PRIORITY_HUBS = ['Varanasi', 'Noida', 'Delhi NCR', 'Bangalore', 'Pune', 'Hyderabad', 'Mumbai', 'Gurugram'];
  const groupedJobs: Record<string, typeof uniqueJobs> = {};
  for (const hub of PRIORITY_HUBS) groupedJobs[hub] = [];
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

  const now = new Date();
  const weekday = now.toLocaleDateString('en-IN', { weekday: 'long' });
  const dateFormatted = now.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  let message = `Hey everyone! ☀️ Happy ${weekday}!\n\n`;
  message += `Here is your daily batch of *verified, active job openings* released directly by top enterprise and tech teams across India today. Every role below has direct ATS application links with zero middleman or agency spam.\n\n`;

  const selectedJobs: any[] = [];
  for (const [hub, jobsInHub] of Object.entries(groupedJobs)) {
    if (jobsInHub.length === 0) continue;
    message += `📍 *${hub.toUpperCase()}*\n`;
    for (const job of jobsInHub) {
      const company = job.company_name || 'Verified Partner';
      const applyUrl = `https://talentxcel.in/jobs/${job.seo_slug || job.id}`;
      
      let salaryStr = '';
      if (job.salary_min && job.salary_min > 0) {
        if (job.salary_min >= 100000) {
          salaryStr = ` (₹${(job.salary_min / 100000).toFixed(1)}L - ${(job.salary_max / 100000).toFixed(1)}L)`;
        } else {
          salaryStr = ` (₹${job.salary_min.toLocaleString('en-IN')})`;
        }
      }

      message += `• *${job.title}* – ${company}${salaryStr}\n`;
      message += `  👉 Direct Apply: ${applyUrl}\n`;

      selectedJobs.push({
        id: job.id,
        title: job.title,
        company,
        location: hub,
      });
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

  const title = `Daily National Digest — ${dateFormatted}`;

  const { data: campaign, error: cErr } = await supabase
    .from('job_alert_campaigns')
    .upsert({
      campaign_date: targetDate,
      title,
      status: 'draft',
      message_text: message,
      job_count: selectedJobs.length,
    }, { onConflict: 'campaign_date,title' })
    .select('id')
    .single();

  if (cErr) {
    console.error('Error saving campaign draft:', cErr);
  } else {
    console.log(`✅ Campaign saved: ID=${campaign?.id}, Total Jobs=${selectedJobs.length}`);
    if (campaign?.id) {
      const links = selectedJobs.map((j, i) => ({
        campaign_id: campaign.id,
        job_id: j.id,
        position: i + 1,
      }));
      await supabase.from('job_alert_campaign_jobs').upsert(links, { onConflict: 'campaign_id,job_id' });
      console.log(`✅ Linked ${links.length} jobs to campaign`);
    }
  }

  console.log('\n--- FORMATTED HUMAN WHATSAPP MESSAGE PREVIEW ---');
  console.log(message);
}

run().catch(console.error);
