const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment from .env.local if present
let serviceKey = process.env.TALENTXCEL_SERVICE_ROLE_KEY;
if (!serviceKey && fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const match = envContent.match(/TALENTXCEL_SERVICE_ROLE_KEY=["']?([^"'\r\n]+)/);
  if (match) serviceKey = match[1];
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const supabase = createClient(SUPABASE_URL, serviceKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc');

async function reconcileQueue() {
  console.log('=== RECONCILING GOOGLE INDEXING QUEUE WITH 2,713 LIVE JOBS ===');

  // 1. Fetch all live jobs (page by 1000)
  let allLiveJobs = [];
  let page = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, seo_slug, title, company_name')
      .eq('is_active', true)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('Error fetching live jobs:', error);
      break;
    }
    allLiveJobs = allLiveJobs.concat(data);
    if (data.length < pageSize) break;
    page++;
  }

  console.log(`✓ Fetched ${allLiveJobs.length} active live jobs from Supabase`);

  const liveJobIds = new Set(allLiveJobs.map(j => j.id));
  const liveJobSlugs = new Set(allLiveJobs.filter(j => j.seo_slug).map(j => j.seo_slug));

  // 2. Scan queued outbox items and drop stale ones
  let totalDropped = 0;
  let offset = 0;
  const batchSize = 500;

  console.log('\n--- Scanning queued outbox items for stale records ---');
  while (true) {
    const { data: outboxBatch, error: outErr } = await supabase
      .from('indexing_outbox')
      .select('id, url')
      .eq('status', 'queued')
      .order('id', { ascending: true })
      .range(0, batchSize - 1);

    if (outErr || !outboxBatch || outboxBatch.length === 0) break;

    const staleIds = [];
    for (const item of outboxBatch) {
      const slugOrId = item.url.replace(/^https?:\/\/[^\/]+\/jobs\//, '').replace(/\/$/, '');
      const isLive = liveJobIds.has(slugOrId) || liveJobSlugs.has(slugOrId);
      if (!isLive) {
        staleIds.push(item.id);
      }
    }

    if (staleIds.length > 0) {
      const { error: dropErr } = await supabase
        .from('indexing_outbox')
        .update({
          status: 'dropped',
          last_error: 'Stale job: not found in active jobs table'
        })
        .in('id', staleIds);

      if (dropErr) {
        console.error('Error dropping stale items:', dropErr);
        break;
      }
      totalDropped += staleIds.length;
      console.log(`  Dropped batch of ${staleIds.length} stale items (Total dropped so far: ${totalDropped})`);
    }

    // If the entire batch was valid, advance or stop
    if (staleIds.length === 0) {
      console.log('✓ No more stale items found in current head of queue!');
      break;
    }
  }

  console.log(`\n✓ Total stale outbox items pruned: ${totalDropped}`);

  // 3. Ensure all 2,713 live jobs exist in outbox with canonical URL
  console.log('\n--- Ensuring all active live jobs are queued with canonical URLs ---');
  
  // Fetch existing URLs in outbox to avoid duplicates
  let existingUrls = new Set();
  let pageOutbox = 0;
  while (true) {
    const { data: outboxRows, error: fetchOutErr } = await supabase
      .from('indexing_outbox')
      .select('url')
      .range(pageOutbox * 1000, (pageOutbox + 1) * 1000 - 1);

    if (fetchOutErr || !outboxRows || outboxRows.length === 0) break;
    outboxRows.forEach(r => existingUrls.add(r.url));
    if (outboxRows.length < 1000) break;
    pageOutbox++;
  }
  console.log(`Existing outbox URLs count: ${existingUrls.size}`);

  const toInsert = [];
  for (const j of allLiveJobs) {
    const canonUrl = `https://talentxcel.in/jobs/${j.seo_slug || j.id}`;
    const subUrl = `https://jobs.talentxcel.in/jobs/${j.seo_slug || j.id}`;
    if (!existingUrls.has(canonUrl) && !existingUrls.has(subUrl)) {
      toInsert.push({
        url: canonUrl,
        action: 'URL_UPDATED',
        priority: 1,
        status: 'queued',
        scheduled_at: new Date().toISOString()
      });
    }
  }

  console.log(`Jobs to insert into outbox: ${toInsert.length}`);
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += 200) {
    const chunk = toInsert.slice(i, i + 200);
    const { error: insErr } = await supabase
      .from('indexing_outbox')
      .insert(chunk);

    if (insErr) {
      console.error(`Error inserting chunk ${i}:`, insErr.message);
    } else {
      inserted += chunk.length;
    }
  }

  console.log(`✓ Inserted ${inserted} active live jobs into indexing_outbox`);

  // Final summary
  const { count: finalQueued } = await supabase.from('indexing_outbox').select('*', { count: 'exact', head: true }).eq('status', 'queued');
  console.log(`\n================================================================`);
  console.log(`🎉 QUEUE RECONCILIATION COMPLETE`);
  console.log(`   - Live Active Jobs In DB : ${allLiveJobs.length}`);
  console.log(`   - Stale Records Dropped   : ${totalDropped}`);
  console.log(`   - Valid Queued Items Now  : ${finalQueued}`);
  console.log(`================================================================`);
}

reconcileQueue().catch(console.error);
