const fs = require('fs');

async function inspect() {
  // Check api/_college-slugs.json
  if (fs.existsSync('api/_college-slugs.json')) {
    const slugs = JSON.parse(fs.readFileSync('api/_college-slugs.json', 'utf8'));
    console.log('Total slugs in api/_college-slugs.json:', slugs.length);
  }

  // Check how sitemap-colleges is generated
  const sitemapGen = fs.readFileSync('scripts/generate-sitemap.ts', 'utf8');
  const collegeMatch = sitemapGen.match(/sitemap-colleges[\s\S]*?generate/);
  console.log('Sitemap college snippet found');

  // Check Supabase colleges
  const { createClient } = require('@supabase/supabase-js');
  const url = "https://dthlgsnakhoftinssokm.supabase.co";
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc";
  const supabase = createClient(url, key);

  const { count: totalDbColleges } = await supabase.from('colleges').select('id', { count: 'exact', head: true });
  console.log('Total colleges in Supabase:', totalDbColleges);

  // Check how many have real placement or NIRF or tuition data
  const { count: nirfCount } = await supabase.from('colleges').select('id', { count: 'exact', head: true }).not('nirf_rank', 'is', null);
  console.log('Colleges with NIRF rank in DB:', nirfCount);
}

inspect();
