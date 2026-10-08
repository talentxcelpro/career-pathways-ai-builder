// scripts/analyze-gsc-url-corpus.cjs
// TalentXcel GSC URL Corpus Forensic Analyzer
// Analyzes the 500,216 "Discovered – currently not indexed", 7,837 Soft 404, 
// 24,872 Alternate Canonical, and 16,715 Duplicate URL populations by URL template.

const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '../public');

// 1. Identify all sitemap files
const sitemapFiles = fs.readdirSync(publicDir)
  .filter(f => f.startsWith('sitemap') && f.endsWith('.xml') && f !== 'sitemap.xml');

console.log(`Found ${sitemapFiles.length} sitemap files in public/ directory.`);

// 2. Parse all URLs from sitemaps and categorize them
const urlPatternMap = new Map();
let totalUrlsParsed = 0;

function categorizeUrl(urlStr) {
  try {
    const url = new URL(urlStr);
    const p = url.pathname.replace(/\/+$/, '') || '/';

    // Base root
    if (p === '') return { template: '/', category: 'BASE_ROOT' };

    // College subtabs
    if (/^\/colleges\/[^\/]+\/courses$/.test(p)) return { template: '/colleges/:slug/courses', category: 'COLLEGE_FACET_COURSES' };
    if (/^\/colleges\/[^\/]+\/fees$/.test(p)) return { template: '/colleges/:slug/fees', category: 'COLLEGE_FACET_FEES' };
    if (/^\/colleges\/[^\/]+\/placements$/.test(p)) return { template: '/colleges/:slug/placements', category: 'COLLEGE_FACET_PLACEMENTS' };
    if (/^\/colleges\/[^\/]+\/cutoffs$/.test(p)) return { template: '/colleges/:slug/cutoffs', category: 'COLLEGE_FACET_CUTOFFS' };
    if (/^\/colleges\/[^\/]+\/scholarships$/.test(p)) return { template: '/colleges/:slug/scholarships', category: 'COLLEGE_FACET_SCHOLARSHIPS' };
    if (/^\/colleges\/[^\/]+\/admissions$/.test(p)) return { template: '/colleges/:slug/admissions', category: 'COLLEGE_FACET_ADMISSIONS' };
    if (/^\/colleges\/[^\/]+\/rankings$/.test(p)) return { template: '/colleges/:slug/rankings', category: 'COLLEGE_FACET_RANKINGS' };
    if (/^\/colleges\/[^\/]+\/reviews$/.test(p)) return { template: '/colleges/:slug/reviews', category: 'COLLEGE_FACET_REVIEWS' };
    if (/^\/colleges\/[^\/]+\/campus$/.test(p)) return { template: '/colleges/:slug/campus', category: 'COLLEGE_FACET_CAMPUS' };

    // College degree matrix
    if (/^\/colleges\/[^\/]+\/in-[^\/]+$/.test(p)) return { template: '/colleges/:degree/in-:stateOrCity', category: 'COLLEGE_DEGREE_LOCATION' };

    // College overview
    if (/^\/colleges\/[^\/]+$/.test(p)) {
      if (['global-programs', 'scholarships', 'career-pathway', 'pathway', 'batch'].includes(p.split('/')[2])) {
        return { template: p, category: 'COLLEGE_STATIC_HUB' };
      }
      return { template: '/colleges/:slug', category: 'COLLEGE_OVERVIEW' };
    }

    // Jobs Matrix Patterns
    // Combinatorial experience jobs: /jobs/:exp-:role-in-:loc
    if (/^\/jobs\/[a-z0-9-]+-in-[a-z0-9-]+$/.test(p)) {
      const match = p.match(/^\/jobs\/([a-z0-9-]+)-in-([a-z0-9-]+)$/);
      if (match) {
        const prefix = match[1];
        if (prefix.startsWith('freshers-') || prefix.startsWith('entry-level-') || prefix.startsWith('junior-') || 
            prefix.startsWith('mid-level-') || prefix.startsWith('senior-') || prefix.startsWith('lead-') || prefix.startsWith('director-')) {
          return { template: '/jobs/:exp-:role-in-:loc', category: 'JOB_EXP_ROLE_LOC_MATRIX' };
        }
        if (prefix.endsWith('-jobs')) {
          return { template: '/jobs/:role-jobs-in-:loc', category: 'JOB_ROLE_LOC_MATRIX' };
        }
      }
    }

    // Salary matrix: /salaries/:role-salary-in-:loc
    if (/^\/salaries\/[a-z0-9-]+-salary-in-[a-z0-9-]+$/.test(p)) {
      return { template: '/salaries/:role-salary-in-:loc', category: 'SALARY_MATRIX' };
    }

    // Company Hiring: /jobs/company/:company/:role
    if (/^\/jobs\/company\/[^\/]+\/[^\/]+$/.test(p)) {
      return { template: '/jobs/company/:company/:role', category: 'JOB_COMPANY_ROLE_MATRIX' };
    }

    // Role x City x Subtopic: /jobs/:role/:city/:subtopic
    if (/^\/jobs\/[^\/]+\/[^\/]+\/[^\/]+$/.test(p)) {
      return { template: '/jobs/:role/:city/:subtopic', category: 'JOB_DEEP_MATRIX' };
    }

    // Role x City: /jobs/:role/:city
    if (/^\/jobs\/[^\/]+\/[^\/]+$/.test(p)) {
      return { template: '/jobs/:role/:city', category: 'JOB_ROLE_CITY_MATRIX' };
    }

    // Single segment /jobs/:slugOrId (could be real job or general slug)
    if (/^\/jobs\/[^\/]+$/.test(p)) {
      return { template: '/jobs/:slugOrId', category: 'JOB_DETAIL_OR_SLUG' };
    }

    // Other hubs
    if (/^\/locations\/[^\/]+$/.test(p)) return { template: '/locations/:slug', category: 'LOCATION_HUB' };
    if (/^\/industries\/[^\/]+$/.test(p)) return { template: '/industries/:slug', category: 'INDUSTRY_HUB' };
    if (/^\/company\/[^\/]+$/.test(p)) return { template: '/company/:slug', category: 'COMPANY_PROFILE' };
    if (/^\/services\/[^\/]+$/.test(p)) return { template: '/services/:slug', category: 'SERVICE_PAGE' };
    if (/^\/topics\/[^\/]+$/.test(p)) return { template: '/topics/:slug', category: 'TOPIC_HUB' };
    if (/^\/career-paths\/[^\/]+$/.test(p)) return { template: '/career-paths/:slug', category: 'CAREER_PATHWAY' };
    if (/^\/posts\/[^\/]+$/.test(p)) return { template: '/posts/:slug', category: 'POST_PAGE' };
    if (/^\/news\/[^\/]+$/.test(p)) return { template: '/news/:slug', category: 'NEWS_PAGE' };
    if (/^\/articles\/[^\/]+$/.test(p)) return { template: '/articles/:slug', category: 'ARTICLE_PAGE' };
    if (/^\/resources\/[^\/]+$/.test(p)) return { template: '/resources/:slug', category: 'RESOURCE_PAGE' };

    return { template: p, category: 'OTHER_PAGES' };
  } catch (e) {
    return { template: 'INVALID', category: 'INVALID' };
  }
}

for (const file of sitemapFiles) {
  const filePath = path.join(publicDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const locMatches = content.match(/<loc>(.*?)<\/loc>/g) || [];

  for (const locTag of locMatches) {
    const rawUrl = locTag.replace(/<\/?loc>/g, '').trim();
    totalUrlsParsed++;
    const { template, category } = categorizeUrl(rawUrl);

    if (!urlPatternMap.has(template)) {
      urlPatternMap.set(template, {
        template,
        category,
        count: 0,
        sampleUrls: [],
        originSitemaps: new Set()
      });
    }

    const entry = urlPatternMap.get(template);
    entry.count++;
    entry.originSitemaps.add(file);
    if (entry.sampleUrls.length < 3) {
      entry.sampleUrls.push(rawUrl);
    }
  }
}

console.log(`\n======================================================`);
console.log(`Total URLs parsed across all public sitemaps: ${totalUrlsParsed}`);
console.log(`Distinct URL patterns identified: ${urlPatternMap.size}`);
console.log(`======================================================\n`);

// Sort patterns by volume
const sortedPatterns = Array.from(urlPatternMap.values())
  .sort((a, b) => b.count - a.count);

// Print Top URL Templates
console.log(`TOP URL PATTERNS BY VOLUME IN SITEMAPS:\n`);
sortedPatterns.forEach((p, idx) => {
  console.log(`${idx + 1}. Template: ${p.template}`);
  console.log(`   Category: ${p.category}`);
  console.log(`   Count in Sitemaps: ${p.count.toLocaleString()}`);
  console.log(`   Sitemaps: ${Array.from(p.originSitemaps).slice(0, 3).join(', ')}${p.originSitemaps.size > 3 ? ` (+${p.originSitemaps.size - 3} more)` : ''}`);
  console.log(`   Sample URLs:`);
  p.sampleUrls.forEach(u => console.log(`     - ${u}`));
  console.log('');
});

// Save structured JSON report
const reportData = {
  totalUrlsParsed,
  analyzedAt: new Date().toISOString(),
  patterns: sortedPatterns.map(p => ({
    ...p,
    originSitemaps: Array.from(p.originSitemaps)
  }))
};

fs.writeFileSync(path.resolve(__dirname, '../GSC_URL_CORPUS_AUDIT.json'), JSON.stringify(reportData, null, 2));
console.log('Saved detailed audit to GSC_URL_CORPUS_AUDIT.json');
