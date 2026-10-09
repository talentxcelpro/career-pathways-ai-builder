import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SUBDOMAIN_IDENTITIES } from '../src/config/subdomainIdentities.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'public');

export function generateSubdomainHomepages() {
  console.log('================================================================');
  console.log('🏗️ GENERATING INDEPENDENT SUBDOMAIN HOMEPAGE HTML FILES');
  console.log('================================================================\n');

  // Find base HTML (prefer dist/index.html if available, fallback to index.html)
  let baseHtml = '';
  const distIndexPath = path.join(DIST_DIR, 'index.html');
  const srcIndexPath = path.join(ROOT_DIR, 'index.html');

  if (fs.existsSync(distIndexPath)) {
    baseHtml = fs.readFileSync(distIndexPath, 'utf8');
    console.log('✓ Using compiled dist/index.html as template base');
  } else if (fs.existsSync(srcIndexPath)) {
    baseHtml = fs.readFileSync(srcIndexPath, 'utf8');
    console.log('✓ Using root index.html as template base');
  } else {
    throw new Error('No index.html template found!');
  }

  // Ensure directories exist
  if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  const subdomains = ['jobs', 'salary', 'careers', 'resume', 'learning', 'colleges', 'employers', 'government', 'passport'];

  for (const sub of subdomains) {
    const identity = SUBDOMAIN_IDENTITIES[sub];
    if (!identity) continue;

    let html = baseHtml;

    // 1. Replace Title
    html = html.replace(/<title>.*?<\/title>/i, `<title>${identity.title}</title>`);

    // 2. Replace Description
    if (/<meta\s+name=["']description["']/i.test(html)) {
      html = html.replace(
        /(<meta\s+name=["']description["']\s+content=")[^"]*(")/i,
        `$1${identity.description}$2`
      );
    } else {
      html = html.replace('</head>', `<meta name="description" content="${identity.description}">\n</head>`);
    }

    // 3. Replace or inject Canonical Tag
    const canonicalTag = `<link rel="canonical" href="${identity.canonical}" />`;
    if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
      html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, canonicalTag);
    } else if (/<link[^>]*rel=["']canonical["'][^>]*>/i.test(html)) {
      html = html.replace(/<link[^>]*rel=["']canonical["'][^>]*>/i, canonicalTag);
    } else {
      html = html.replace('</head>', `${canonicalTag}\n</head>`);
    }

    // 4. Inject OpenGraph tags
    html = html.replace(/(<meta\s+property=["']og:title["']\s+content=")[^"]*(")/i, `$1${identity.title}$2`);
    html = html.replace(/(<meta\s+property=["']og:description["']\s+content=")[^"]*(")/i, `$1${identity.description}$2`);
    html = html.replace(/(<meta\s+property=["']og:url["']\s+content=")[^"]*(")/i, `$1${identity.canonical}$2`);

    // 5. Inject Structured Data JSON-LD
    const jsonLdScript = `\n<script type="application/ld+json">\n${JSON.stringify(identity.schemaJsonLd, null, 2)}\n</script>\n`;
    html = html.replace('</head>', `${jsonLdScript}</head>`);

    // 6. Inject Semantic Crawlable Content inside body before root
    const crawlableContainer = `\n<div id="tx-pre-rendered-seo" style="display:none;" data-subdomain="${sub}">\n${identity.staticHeroHtml}\n</div>\n`;
    html = html.replace('<div id="root">', `${crawlableContainer}<div id="root">`);

    // Write to dist/ and public/
    const filename = `index-${sub}.html`;
    const distPath = path.join(DIST_DIR, filename);
    const publicPath = path.join(PUBLIC_DIR, filename);

    fs.writeFileSync(distPath, html, 'utf8');
    fs.writeFileSync(publicPath, html, 'utf8');

    console.log(`  ✓ Generated ${filename} (${html.length} bytes, canonical: ${identity.canonical})`);
  }

  console.log('\n✅ All 9 independent subdomain HTML homepages generated successfully!\n');
}

// Execute directly if run via CLI
if (process.argv[1] && process.argv[1].endsWith('generate-subdomain-homepages.ts')) {
  generateSubdomainHomepages();
}
