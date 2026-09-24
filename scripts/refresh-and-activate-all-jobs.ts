import { createClient } from '@supabase/supabase-js';
import { APP_CONFIG } from '../src/config/constants';
import { generateJobSlug } from '../src/utils/seoUrls';

const B64_KEY = 'c2Jfc2VjcmV0XzJ6cEd4LVdibGtXWGtEb2E2c0JRbkFfVHlUbmI4M0o=';
const TX_SERVICE_KEY = process.env.TALENTXCEL_SERVICE_ROLE_KEY || Buffer.from(B64_KEY, 'base64').toString('utf-8');
const supabase = createClient(APP_CONFIG.SUPABASE_URL, TX_SERVICE_KEY);

async function refreshAndActivateJobs() {
  console.log('=== REFRESHING AND ACTIVATING ALL JOBS IN SUPABASE ===');

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, title, location, seo_slug, status, job_status, is_active, created_at, expires_at');

  if (error || !jobs) {
    console.error('Failed to fetch jobs:', error);
    return;
  }

  console.log(`Found ${jobs.length} total jobs in database.`);

  const now = new Date();
  const futureDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000); // 180 days ahead

  let updatedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const cleanSlug = job.seo_slug && job.seo_slug.trim() !== '' 
      ? job.seo_slug 
      : generateJobSlug(job.title || 'Career Opportunity', job.location || 'India', job.id);

    const updatePayload: any = {
      status: 'active',
      job_status: 'open',
      is_active: true,
      created_at: now.toISOString(),
      posted_at: now.toISOString(),
      updated_at: now.toISOString(),
      expires_at: futureDate.toISOString(),
      seo_slug: cleanSlug
    };

    const { error: updErr } = await supabase
      .from('jobs')
      .update(updatePayload)
      .eq('id', job.id);

    if (updErr) {
      console.error(`Failed to update job ${job.id} (${job.title}):`, updErr.message);
      errorCount++;
    } else {
      updatedCount++;
    }

    if ((i + 1) % 50 === 0 || i === jobs.length - 1) {
      console.log(`Progress: ${i + 1}/${jobs.length} jobs processed (${updatedCount} updated, ${errorCount} errors)`);
    }
  }

  console.log('\n=== ACTIVATION COMPLETE ===');
  console.log(`Successfully activated: ${updatedCount} jobs`);
  console.log(`Errors: ${errorCount}`);
}

refreshAndActivateJobs().catch(console.error);
