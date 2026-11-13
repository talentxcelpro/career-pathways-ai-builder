const fs = require('fs');

let content = fs.readFileSync('scripts/generate-sitemap.ts', 'utf8');

// Update select query to fetch expires_at and job_status
content = content.replace(
  ".select('id, seo_slug, created_at, posted_at')",
  ".select('id, seo_slug, created_at, posted_at, expires_at, job_status')"
);

// Add expired job filter
const targetLoop = `      allDbJobs.forEach(j => {
        const slug = j.seo_slug || j.id;`;

const replacementLoop = `      allDbJobs.forEach(j => {
        if (j.is_active === false || j.job_status === 'closed' || j.job_status === 'expired') return;
        if (j.expires_at && !isNaN(new Date(j.expires_at).getTime()) && new Date(j.expires_at).getTime() < Date.now()) return;
        const slug = j.seo_slug || j.id;`;

content = content.replace(targetLoop, replacementLoop);

fs.writeFileSync('scripts/generate-sitemap.ts', content, 'utf8');
console.log('Successfully added closed/expired job exclusion to scripts/generate-sitemap.ts');
