/**
 * scripts/gsc-indexing-analyzer.cjs
 *
 * Ingests Google Search Console export files (Pages.csv / Indexing.csv / Queries.csv)
 * Groups URLs by indexing reason and page template archetype.
 * Diagnoses root technical causes for "Crawled - currently not indexed"
 * and "Duplicate without user-selected canonical".
 *
 * Usage:
 *   node scripts/gsc-indexing-analyzer.cjs --pages=<path_to_pages.csv> --reasons=<path_to_reasons.csv>
 */

const fs = require('fs');
const path = require('path');

// URL pattern classifiers
function classifyUrlPattern(url) {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const parts = pathname.split('/').filter(Boolean);

    if (parts.length === 0) return 'HOME_ROOT';

    const p0 = parts[0].toLowerCase();
    const p1 = parts[1] ? parts[1].toLowerCase() : '';
    const p2 = parts[2] ? parts[2].toLowerCase() : '';

    if (p0 === 'jobs') {
      if (parts.length === 1) return 'JOBS_HOME';
      if (p1.includes('-in-')) return 'PHANTOM_ROLE_CITY_CORRIDOR';
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p1)) return 'JOB_UUID_DETAIL';
      if (parts.length === 2) return 'JOB_SLUG_DETAIL';
      if (parts.length === 3) return 'JOB_ROLE_CITY_SUBPAGE';
      return 'JOB_OTHER';
    }

    if (p0 === 'colleges') {
      if (parts.length === 1) return 'COLLEGES_HOME';
      if (parts.length === 2) return 'COLLEGE_INSTITUTION_DOSSIER';
      if (parts.length === 3) return `COLLEGE_SUBTAB_${p2.toUpperCase()}`; // fees, cutoffs, placements
      return 'COLLEGE_OTHER';
    }

    if (p0 === 'salary' || p0 === 'salaries') {
      if (parts.length === 1) return 'SALARY_HOME';
      if (p1.includes('-in-') || p1.includes('-salary')) return 'SALARY_ROLE_CITY_MATRIX';
      return 'SALARY_OTHER';
    }

    if (p0 === 'resume') return 'RESUME_TOOLS';
    if (p0 === 'learning') return 'LEARNING_COURSES';
    if (p0 === 'passport') return 'PASSPORT_SURFACES';
    if (p0 === 'post' || p0 === 'posts' || p0 === 'blog' || p0 === 'news') return 'EDITORIAL_POSTS';
    if (p0 === 'company' || p0 === 'companies') return 'COMPANY_PROFILES';
    if (p0 === 'locations' || p0 === 'directory') return 'DIRECTORY_LOCATION_HUBS';

    return 'OTHER_GENERAL';
  } catch {
    return 'MALFORMED_URL';
  }
}

function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Simple regex CSV splitter supporting quotes
    const regex = /(?:^|,)(?:"([^"]*)"|([^,]*))/g;
    const values = [];
    let match;
    while ((match = regex.exec(rawLine)) !== null) {
      values.push((match[1] !== undefined ? match[1] : match[2] || '').trim());
    }
    // Align with header
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }

  return rows;
}

function analyzeGscExport(pagesCsvPath, reasonsCsvPath) {
  console.log('='.repeat(70));
  console.log('TALENTXCEL GSC INDEXING ANALYSIS ENGINE');
  console.log('='.repeat(70));

  if (!fs.existsSync(pagesCsvPath)) {
    console.error(`Pages CSV file not found at: ${pagesCsvPath}`);
    console.log('\nData Template Expected:\nPlace Google Search Console exports in "scratch/gsc-data/"');
    return;
  }

  const pagesContent = fs.readFileSync(pagesCsvPath, 'utf8');
  const pagesRows = parseCSV(pagesContent);
  console.log(`✓ Loaded ${pagesRows.length} URL entries from Pages export.`);

  // Group by Reason & Pattern
  const byReason = new Map();
  const byPattern = new Map();
  const matrix = {}; // [reason][pattern] = count

  pagesRows.forEach(row => {
    const url = row['URL'] || row['Page'] || row['Top pages'] || Object.values(row)[0];
    const reason = row['Reason'] || row['Indexing state'] || row['Status'] || 'Unknown';
    const pattern = classifyUrlPattern(url);

    // Reason tally
    byReason.set(reason, (byReason.get(reason) || 0) + 1);

    // Pattern tally
    byPattern.set(pattern, (byPattern.get(pattern) || 0) + 1);

    // Matrix tally
    if (!matrix[reason]) matrix[reason] = {};
    matrix[reason][pattern] = (matrix[reason][pattern] || 0) + 1;
  });

  console.log('\n--- 1. DISTRIBUTION BY GSC NOT-INDEXED REASON ---');
  for (const [reason, count] of byReason.entries()) {
    console.log(`• ${reason.padEnd(45)} : ${count.toString().padStart(6)} URLs`);
  }

  console.log('\n--- 2. DISTRIBUTION BY URL ARCHETYPE ---');
  for (const [pattern, count] of byPattern.entries()) {
    console.log(`• ${pattern.padEnd(40)} : ${count.toString().padStart(6)} URLs`);
  }

  console.log('\n--- 3. CROSS-TABULATION MATRIX (REASON x ARCHETYPE) ---');
  console.table(matrix);

  console.log('\n--- 4. ACTIONABLE REMEDIATION RECOMMENDATIONS ---');
  console.log(`
1. "Crawled - currently not indexed":
   - COLLEGE_SUBTAB_*: Consolidate 9 thin facet subtabs into canonical /colleges/:slug with tabbed UI. Return 301 or canonical tag.
   - PHANTOM_ROLE_CITY_CORRIDOR: If 0 jobs in DB, return HTTP 410 or 301 to parent /jobs. Remove from internal linking blocks.
   - SALARY_ROLE_CITY_MATRIX: Enrich with real CTC data from active postings or noindex until sample size >= 5 jobs.

2. "Duplicate without user-selected canonical":
   - Subdomain collisions (e.g. jobs.talentxcel.in vs talentxcel.in/jobs):
     Strictly enforce apex self-canonical in HTML and headers.
   - Trailing slash variants (/url/ vs /url):
     Ensure edge 301 redirects are in place before crawler reaches SPA.
  `);
}

// Check command line arguments
const args = process.argv.slice(2);
const pagesArg = args.find(a => a.startsWith('--pages='));
const reasonsArg = args.find(a => a.startsWith('--reasons='));

if (pagesArg) {
  const pagesPath = pagesArg.replace('--pages=', '');
  const reasonsPath = reasonsArg ? reasonsArg.replace('--reasons=', '') : '';
  analyzeGscExport(pagesPath, reasonsPath);
} else {
  console.log('GSC Indexing Analyzer Script Ready.');
  console.log('To run when GSC CSV exports arrive:');
  console.log('  node scripts/gsc-indexing-analyzer.cjs --pages=scratch/gsc-pages.csv');
}
