import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SUBDOMAIN_IDENTITIES, buildSpecialistInitialHtml } from '../src/config/subdomainIdentities.js';

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
  let rawBaseHtml = '';
  const distIndexPath = path.join(DIST_DIR, 'index.html');
  const srcIndexPath = path.join(ROOT_DIR, 'index.html');

  if (fs.existsSync(distIndexPath)) {
    rawBaseHtml = fs.readFileSync(distIndexPath, 'utf8');
    console.log('✓ Using compiled dist/index.html as template base');
  } else if (fs.existsSync(srcIndexPath)) {
    rawBaseHtml = fs.readFileSync(srcIndexPath, 'utf8');
    console.log('✓ Using root index.html as template base');
  } else {
    throw new Error('No index.html template found!');
  }

  // Ensure directories exist
  if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  // 1. Clean the base template of ALL generic root crawler content and hidden divs
  let baseTemplate = rawBaseHtml;

  // Remove generic crawler article
  baseTemplate = baseTemplate.replace(/<article[\s\S]*?class=["'][^"']*tx-crawler-content[^"']*["'][\s\S]*?<\/article>\s*/gi, '');

  // Remove generic crawler header and footer
  baseTemplate = baseTemplate.replace(/<header[\s\S]*?class=["'][^"']*tx-crawler-header[^"']*["'][\s\S]*?<\/header>\s*/gi, '');
  baseTemplate = baseTemplate.replace(/<footer[\s\S]*?class=["'][^"']*tx-crawler-footer[^"']*["'][\s\S]*?<\/footer>\s*/gi, '');

  // Remove legacy tx-pre-rendered-seo or tx-initial-content
  baseTemplate = baseTemplate.replace(/<div id=["']tx-pre-rendered-seo["'][\s\S]*?<\/div>\s*/gi, '');
  baseTemplate = baseTemplate.replace(/<div id=["']tx-initial-content["'][\s\S]*?<\/div>\s*/gi, '');

  // Remove stale JSON-LD schemas from base template
  baseTemplate = baseTemplate.replace(/<script type=["']application\/ld\+json["']>[\s\S]*?<\/script>\s*/gi, '');

  // Normalize root div to empty
  baseTemplate = baseTemplate.replace(/<div id=["']root["']>[\s\S]*?<\/div>/gi, '<div id="root"></div>');

  const subdomains = ['jobs', 'salary', 'careers', 'resume', 'learning', 'colleges', 'employers', 'government', 'passport'];

  for (const sub of subdomains) {
    const identity = SUBDOMAIN_IDENTITIES[sub];
    if (!identity) continue;

    let html = baseTemplate;

    // 1. Replace Title (Domain-specific title)
    html = html.replace(/<title>.*?<\/title>/i, `<title>${identity.title}</title>`);

    // 2. Replace Description (Domain-specific meta description)
    if (/<meta\s+name=["']description["']/i.test(html)) {
      html = html.replace(
        /(<meta\s+name=["']description["']\s+content=")[^"]*(")/gi,
        `$1${identity.description}$2`
      );
    } else {
      html = html.replace('</head>', `<meta name="description" content="${identity.description}">\n</head>`);
    }

    // 3. Remove all existing canonical tags and inject single authoritative self-referencing canonical
    html = html.replace(/<link[^>]*rel=["']canonical["'][^>]*>\s*/gi, '');
    const canonicalTag = `<link rel="canonical" href="${identity.canonical}" />\n`;
    html = html.replace('</head>', `${canonicalTag}</head>`);

    // 4. Update Open Graph tags
    html = html.replace(/(<meta\s+property=["']og:title["']\s+content=")[^"]*(")/gi, `$1${identity.title}$2`);
    html = html.replace(/(<meta\s+property=["']og:description["']\s+content=")[^"]*(")/gi, `$1${identity.description}$2`);
    html = html.replace(/(<meta\s+property=["']og:url["']\s+content=")[^"]*(")/gi, `$1${identity.canonical}$2`);

    // 5. Update Twitter Card tags
    html = html.replace(/(<meta\s+name=["']twitter:title["']\s+content=")[^"]*(")/gi, `$1${identity.title}$2`);
    html = html.replace(/(<meta\s+name=["']twitter:description["']\s+content=")[^"]*(")/gi, `$1${identity.description}$2`);

    // 6. Enforce official absolute favicon URL
    const officialFaviconUrl = 'https://talentxcel.in/lovable-uploads/2f30b9a2-a492-4725-b98c-334796c21e32.png';
    html = html.replace(/href="\/lovable-uploads\/2f30b9a2-a492-4725-b98c-334796c21e32\.png"/g, `href="${officialFaviconUrl}"`);

    // 7. Inject Subdomain Structured Data JSON-LD (relevant schema only; no deprecated FAQPage schema)
    const jsonLdScript = `\n<script type="application/ld+json">\n${JSON.stringify(identity.schemaJsonLd, null, 2)}\n</script>\n`;
    html = html.replace('</head>', `${jsonLdScript}</head>`);

    // 8. Inject User-Visible, Accessible Semantic Initial HTML inside <div id="root">
    // This provides immediate, meaningful crawlable content with exactly ONE <h1> tag and zero hidden text.
    // When JavaScript runs, React cleanly takes over the container without hydration errors or dual UI.
    const initialSpecialistHtml = buildSpecialistInitialHtml(identity);
    html = html.replace(
      '<div id="root"></div>',
      `<div id="root">\n${initialSpecialistHtml}\n</div>`
    );

    // Write to dist/ (if it exists) and public/
    const filename = `index-${sub}.html`;
    const publicPath = path.join(PUBLIC_DIR, filename);
    fs.writeFileSync(publicPath, html, 'utf8');

    if (fs.existsSync(DIST_DIR)) {
      const distPath = path.join(DIST_DIR, filename);
      fs.writeFileSync(distPath, html, 'utf8');
    }

    console.log(`  ✓ Generated ${filename} (${html.length} bytes, canonical: ${identity.canonical})`);
  }

  console.log('\n✅ All 9 independent subdomain HTML homepages generated successfully!\n');
}

// Execute directly if run via CLI
if (process.argv[1] && process.argv[1].endsWith('generate-subdomain-homepages.ts')) {
  generateSubdomainHomepages();
}
