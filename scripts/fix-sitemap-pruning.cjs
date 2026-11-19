const fs = require('fs');
const path = require('path');

const sitemapPath = path.resolve('scripts/generate-sitemap.ts');
let code = fs.readFileSync(sitemapPath, 'utf8');

// Replace the loop start in sitemapConfig.forEach
const replacement = `    if (uniqueEntries.length === 0) {
      console.log(\`↷ Skipped \${filename}: all URLs already appear in an earlier sitemap\`);
      return;
    }

    // Google Search Console Quality Gate: Prune thin sitemaps with fewer than 10 URLs (e.g. sitemap-blog, sitemap-news)
    if (uniqueEntries.length < 10) {
      console.log(\`↷ Pruned thin sitemap \${filename}: contains only \${uniqueEntries.length} URLs (< 10 quality threshold)\`);
      const existingFile = resolve(publicDir, filename);
      if (existsSync(existingFile)) {
        try { unlinkSync(existingFile); } catch (_) {}
      }
      return;
    }`;

// Use flexible regex to handle CRLF and whitespace variations
code = code.replace(
  /if\s*\(\s*uniqueEntries\.length\s*===\s*0\s*\)\s*\{\s*console\.log\(`↷ Skipped \$\{filename\}: all URLs already appear in an earlier sitemap`\);\s*return;\s*\}/,
  replacement
);

fs.writeFileSync(sitemapPath, code, 'utf8');
console.log('✓ Successfully injected thin sitemap pruning into scripts/generate-sitemap.ts');
