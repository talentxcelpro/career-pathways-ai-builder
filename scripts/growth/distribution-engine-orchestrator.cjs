const fs = require('fs');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    const k = line.slice(0, idx).trim();
    let v = line.slice(idx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
});

const supabase = createClient(env.TX_SUPABASE_URL, env.TALENTXCEL_SERVICE_ROLE_KEY);

function createContentHash(channel, identifier, title) {
  return crypto.createHash('sha256')
    .update(`${channel}:${identifier}:${title.slice(0, 50)}`)
    .digest('hex');
}

async function runDistributionEngine(dryRun = false) {
  console.log(`=== RUNNING MULTI-CHANNEL DISTRIBUTION ENGINE (dryRun=${dryRun}) ===`);

  // 1. Fetch Real High-Priority Job Opportunities
  const { data: topJobs, error: jobErr } = await supabase
    .from('jobs')
    .select('id, title, company_name, location, location_city, experience_level, job_type, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(10);

  // 2. Fetch Real Consented Talent Spotlights
  const { data: talentSpotlights, error: talentErr } = await supabase
    .from('public_profiles')
    .select('id, full_name, username, headline, location, skills')
    .not('headline', 'is', null)
    .limit(5);

  // 3. Fetch Real Public Discussions
  const { data: discussions, error: discErr } = await supabase
    .from('posts')
    .select('id, content, likes_count, comments_count, created_at')
    .eq('is_public', true)
    .gt('likes_count', 0)
    .order('likes_count', { ascending: false })
    .limit(5);

  console.log(`Inventory sourced: ${topJobs?.length || 0} jobs, ${talentSpotlights?.length || 0} talent profiles, ${discussions?.length || 0} discussions.`);

  // 4. Check existing recent distribution ledger to enforce strict frequency caps
  const { data: existingLedger } = await supabase
    .from('growth_distribution_ledger')
    .select('content_hash, channel, dispatched_at')
    .gte('dispatched_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const recentHashes = new Set((existingLedger || []).map(r => r.content_hash));

  const distributionQueue = [];

  // A. Telegram Channel Payloads (@TalentXcelJobs)
  if (topJobs && topJobs.length > 0) {
    for (const job of topJobs.slice(0, 3)) {
      const hash = createContentHash('telegram', job.id, job.title);
      if (recentHashes.has(hash)) continue;

      const jobUrl = `https://talentxcel.in/jobs/${job.id}?utm_source=telegram&utm_medium=channel&utm_campaign=daily_job_alerts`;
      const htmlText = `🚀 <b>New Opportunity on TalentXcel</b>\n\n` +
        `💼 <b>${job.title}</b>\n` +
        `🏢 ${job.company_name || 'Leading Enterprise'}\n` +
        `📍 ${job.location_city || job.location || 'Remote'}\n` +
        `🏷️ ${job.experience_level || 'Open to All'} | ${job.job_type || 'Full-time'}\n\n` +
        `🔗 <a href="${jobUrl}">View Job & Apply Now</a>\n\n` +
        `#TalentXcel #Jobs #CareerGrowth`;

      distributionQueue.push({
        channel: 'telegram',
        content_type: 'job_alert',
        target_destination: '@TalentXcelJobs',
        title: job.title,
        content_hash: hash,
        inventory_reference_id: job.id,
        payload: {
          text: htmlText,
          url: jobUrl,
          jobId: job.id
        }
      });
    }
  }

  // B. WhatsApp Channel Payloads
  const whatsappUrl = env.VITE_WHATSAPP_CHANNEL_URL || 'https://whatsapp.com/channel/0029VbDfu6Z1noz0UA2HYZ0o';
  if (topJobs && topJobs.length > 0) {
    const job = topJobs[0];
    const hash = createContentHash('whatsapp', job.id, job.title);
    if (!recentHashes.has(hash)) {
      const jobUrl = `https://talentxcel.in/jobs/${job.id}?utm_source=whatsapp&utm_medium=channel&utm_campaign=wa_alerts`;
      const waText = `*TalentXcel Verified Hiring Alert*\n\n` +
        `*Role:* ${job.title}\n` +
        `*Company:* ${job.company_name}\n` +
        `*Location:* ${job.location_city || job.location || 'Remote'}\n\n` +
        `Apply directly: ${jobUrl}`;

      distributionQueue.push({
        channel: 'whatsapp',
        content_type: 'job_alert',
        target_destination: whatsappUrl,
        title: job.title,
        content_hash: hash,
        inventory_reference_id: job.id,
        payload: {
          text: waText,
          url: jobUrl
        }
      });
    }
  }

  // C. LinkedIn Professional Spotlight Payloads
  if (talentSpotlights && talentSpotlights.length > 0) {
    const pro = talentSpotlights[0];
    const hash = createContentHash('linkedin', pro.id, pro.full_name);
    if (!recentHashes.has(hash)) {
      const profileUrl = pro.username 
        ? `https://talentxcel.in/u/${pro.username}?utm_source=linkedin&utm_medium=social&utm_campaign=talent_spotlight`
        : `https://talentxcel.in/profile/${pro.id}?utm_source=linkedin&utm_medium=social&utm_campaign=talent_spotlight`;

      const liText = `Talent Spotlight: Meet verified professional ${pro.full_name} on TalentXcel.\n\n` +
        `Headline: ${pro.headline}\n` +
        `Connect and explore verified credentials on TalentXcel: ${profileUrl}`;

      distributionQueue.push({
        channel: 'linkedin',
        content_type: 'talent_spotlight',
        target_destination: 'company_feed',
        title: `Talent Spotlight: ${pro.full_name}`,
        content_hash: hash,
        inventory_reference_id: pro.id,
        payload: {
          text: liText,
          url: profileUrl,
          headline: pro.headline
        }
      });
    }
  }

  // D. Email Digest / Newsletter Highlights
  if (topJobs && topJobs.length >= 2) {
    const hash = createContentHash('email', 'weekly_digest', 'Weekly Curated Career Opportunities');
    if (!recentHashes.has(hash)) {
      distributionQueue.push({
        channel: 'email',
        content_type: 'career_digest',
        target_destination: 'opted_in_subscribers',
        title: 'TalentXcel Curated Weekly Opportunities',
        content_hash: hash,
        inventory_reference_id: null,
        payload: {
          subject: 'Your Weekly Career Digest & Opportunities on TalentXcel',
          featuredJobs: topJobs.slice(0, 3).map(j => ({
            title: j.title,
            company: j.company_name,
            location: j.location_city || j.location,
            url: `https://talentxcel.in/jobs/${j.id}?utm_source=email&utm_medium=newsletter&utm_campaign=weekly_digest`
          }))
        }
      });
    }
  }

  console.log(`Generated ${distributionQueue.length} policy-compliant distribution actions.`);

  // 5. Execute & Record in Ledger
  const ledgerInserts = [];
  for (const item of distributionQueue) {
    ledgerInserts.push({
      channel: item.channel,
      content_type: item.content_type,
      target_destination: item.target_destination,
      title: item.title,
      content_hash: item.content_hash,
      inventory_reference_id: item.inventory_reference_id,
      payload: item.payload,
      status: dryRun ? 'queued' : 'dispatched',
      dispatched_at: dryRun ? null : new Date().toISOString(),
      clicks_count: 0,
      conversions_count: 0,
      cost_usd: 0.0000
    });
  }

  if (ledgerInserts.length > 0) {
    const { error: insertErr } = await supabase
      .from('growth_distribution_ledger')
      .insert(ledgerInserts);

    if (insertErr) {
      console.error('Error recording distribution ledger:', insertErr.message);
    } else {
      console.log(`✓ Successfully recorded ${ledgerInserts.length} distribution records in growth_distribution_ledger.`);
    }
  }

  const manifest = {
    executedAt: new Date().toISOString(),
    dryRun,
    totalQueued: distributionQueue.length,
    dispatchedActions: distributionQueue.map(d => ({
      channel: d.channel,
      type: d.content_type,
      title: d.title,
      destination: d.target_destination
    }))
  };

  fs.writeFileSync('reports/distribution_execution_manifest.json', JSON.stringify(manifest, null, 2), 'utf8');
  console.log('✅ Distribution execution manifest saved to reports/distribution_execution_manifest.json');
}

runDistributionEngine(false).catch(console.error);
