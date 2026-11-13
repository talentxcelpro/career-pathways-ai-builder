const fs = require('fs');
const path = require('path');

const sitemapPath = path.join(__dirname, '../scripts/generate-sitemap.ts');
let content = fs.readFileSync(sitemapPath, 'utf8');

const targetAnchor = '    console.log(`✓ Fetched ${allDbJobs.length} active jobs from database for sitemap-jobs.xml`);';

const addition = `    // Add 5 Verified International Landing Page Hubs
    const internationalHubSlugs = [
      'data-analyst-dubai-uae',
      'software-engineer-abu-dhabi-uae',
      'cloud-engineer-riyadh-saudi-arabia',
      'data-analyst-remote-usa',
      'software-engineer-remote-us'
    ];
    internationalHubSlugs.forEach(slug => {
      activeJobEntriesList.push({
        path: \`/jobs/\${slug}\`,
        changefreq: 'daily',
        priority: '0.9',
        lastmod: new Date().toISOString().split('T')[0]
      });
    });
`;

if (!content.includes('const internationalHubSlugs = [')) {
  content = content.replace(targetAnchor, `${addition}\r\n${targetAnchor}`);
  content = content.replace(targetAnchor, `${addition}\n${targetAnchor}`);
}

fs.writeFileSync(sitemapPath, content, 'utf8');
console.log('✓ Successfully added international landing page hubs to scripts/generate-sitemap.ts');
