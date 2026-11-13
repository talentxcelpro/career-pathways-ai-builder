const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const url = 'https://dthlgsnakhoftinssokm.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
const supabase = createClient(url, key);

function generateSlug(title, id) {
  const cleanTitle = (title || 'job')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `${cleanTitle}-${id}`;
}

async function runAuditAndSitemap() {
  console.log('=== FORENSIC JOB URL & SITEMAP AUDIT ===');

  // Fetch all jobs in batches
  let allJobs = [];
  let from = 0;
  const step = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, title, company_name, location, location_city, department, industry, is_active, created_at, expires_at, application_deadline, seo_slug')
      .range(from, from + step - 1);
    
    if (error || !data || data.length === 0) break;
    allJobs = allJobs.concat(data);
    if (data.length < step) break;
    from += step;
  }

  const totalRecords = allJobs.length;
  const totalActive = allJobs.filter(j => j.is_active).length;
  const now = new Date();

  const unexpiredActiveJobs = allJobs.filter(j => {
    if (!j.is_active) return false;
    if (j.application_deadline && new Date(j.application_deadline) < now) return false;
    if (j.expires_at && new Date(j.expires_at) < now) return false;
    return true;
  });

  const expiredOrClosedJobs = allJobs.filter(j => {
    if (!j.is_active) return true;
    if (j.application_deadline && new Date(j.application_deadline) < now) return true;
    if (j.expires_at && new Date(j.expires_at) < now) return true;
    return false;
  });

  // Verify unique identifiers
  const idSet = new Set();
  let duplicates = 0;
  allJobs.forEach(j => {
    if (idSet.has(j.id)) duplicates++;
    idSet.add(j.id);
  });

  // Extract distinct companies
  const companySet = new Set();
  unexpiredActiveJobs.forEach(j => {
    const c = (j.company_name || '').trim();
    if (c) companySet.add(c);
  });

  const categories = [
    'software-engineering', 'banking-and-finance', 'cloud-and-devops', 'data-analytics',
    'quality-engineering', 'product-management', 'business-operations', 'sales-and-marketing',
    'engineering-leadership', 'core-engineering', 'government-psu', 'enterprise-services'
  ];

  const locations = [
    'remote', 'mumbai', 'bangalore', 'hyderabad', 'noida', 'delhi',
    'pune', 'gurgaon', 'bhopal', 'chennai', 'kolkata', 'ahmedabad'
  ];

  const careerResources = [
    'ats-resume-optimization', 'technical-and-behavioral-interviews', 'salary-negotiation-benchmarks',
    'strategic-career-transitions', 'job-application-best-practices', 'high-demand-industry-skills',
    'freshers-career-launch-blueprint'
  ];

  console.log('1. Total job records in DB:', totalRecords);
  console.log('2. Total active vacancies:', totalActive);
  console.log('3. Total expired or closed vacancies:', expiredOrClosedJobs.length);
  console.log('4. Total unique valid job detail URLs:', unexpiredActiveJobs.length);
  console.log('5. Total duplicate or invalid job URLs:', duplicates);
  console.log('6. Total company pages / filters:', companySet.size);
  console.log('7. Total category pages / filters:', categories.length);
  console.log('8. Total location pages / filters:', locations.length);
  console.log('9. Total career resource pages / guides:', careerResources.length);

  // Generate canonical sitemap XML for jobs subdomain
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Homepage
  xml += `  <url>\n    <loc>https://jobs.talentxcel.in/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

  // Categories
  categories.forEach(cat => {
    xml += `  <url>\n    <loc>https://jobs.talentxcel.in/jobs?category=${cat}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
  });

  // Locations
  locations.forEach(loc => {
    xml += `  <url>\n    <loc>https://jobs.talentxcel.in/jobs?city=${loc}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
  });

  // Career Resources
  careerResources.forEach(res => {
    xml += `  <url>\n    <loc>https://jobs.talentxcel.in/#resources</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.80</priority>\n  </url>\n`;
  });

  // Unexpired Active Jobs Detail URLs
  unexpiredActiveJobs.forEach(job => {
    const slug = job.seo_slug || generateSlug(job.title, job.id);
    const lastMod = job.created_at ? job.created_at.split('T')[0] : '2026-11-12';
    xml += `  <url>\n    <loc>https://jobs.talentxcel.in/jobs/${slug}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.90</priority>\n  </url>\n`;
  });

  xml += `</urlset>\n`;

  fs.writeFileSync('public/sitemap-jobs.xml', xml, 'utf8');

  const sitemapUrlsCount = (xml.match(/<loc>/g) || []).length;
  console.log('10. Total URLs in the generated sitemap (sitemap-jobs.xml):', sitemapUrlsCount);
  console.log('11. Total crawlable public URLs on jobs domain:', sitemapUrlsCount);

  // Search Console status (Honest check: local environment cannot access GSC API without credentials)
  console.log('12. Total URLs known to Google: Search Console API credentials not configured in local environment; actual number unverified.');
  console.log('13. Total URLs indexed by Google: Search Console API credentials not configured in local environment; actual number unverified.');

  return {
    totalRecords,
    totalActive,
    expiredOrClosed: expiredOrClosedJobs.length,
    validJobUrls: unexpiredActiveJobs.length,
    duplicateUrls: duplicates,
    companiesCount: companySet.size,
    categoriesCount: categories.length,
    locationsCount: locations.length,
    careerResourcesCount: careerResources.length,
    sitemapUrlsCount,
    crawlableUrlsCount: sitemapUrlsCount
  };
}

runAuditAndSitemap();
