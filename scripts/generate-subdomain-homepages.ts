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
        /(<meta\s+name=["']description["']\s+content=")[^"]*(")/gi,
        `$1${identity.description}$2`
      );
    } else {
      html = html.replace('</head>', `<meta name="description" content="${identity.description}">\n</head>`);
    }

    // 3. Remove all existing canonical tags and inject single accurate canonical tag
    html = html.replace(/<link[^>]*rel=["']canonical["'][^>]*>\s*/gi, '');
    const canonicalTag = `<link rel="canonical" href="${identity.canonical}" />\n`;
    html = html.replace('</head>', `${canonicalTag}</head>`);

    // 4. Remove any duplicate prerendered og tags and replace them with subdomain-specific values
    html = html.replace(/(<meta\s+property=["']og:title["']\s+content=")[^"]*(")/gi, `$1${identity.title}$2`);
    html = html.replace(/(<meta\s+property=["']og:description["']\s+content=")[^"]*(")/gi, `$1${identity.description}$2`);
    html = html.replace(/(<meta\s+property=["']og:url["']\s+content=")[^"]*(")/gi, `$1${identity.canonical}$2`);

    // 5. Inject Twitter Card tags
    html = html.replace(/(<meta\s+name=["']twitter:title["']\s+content=")[^"]*(")/gi, `$1${identity.title}$2`);
    html = html.replace(/(<meta\s+name=["']twitter:description["']\s+content=")[^"]*(")/gi, `$1${identity.description}$2`);

    // 6. Enforce official absolute favicon URL
    const officialFaviconUrl = 'https://talentxcel.in/lovable-uploads/2f30b9a2-a492-4725-b98c-334796c21e32.png';
    html = html.replace(/href="\/lovable-uploads\/2f30b9a2-a492-4725-b98c-334796c21e32\.png"/g, `href="${officialFaviconUrl}"`);

    // 7. Remove any stale root WebPage JSON-LD schema if present in base template
    html = html.replace(/<script type="application\/ld\+json">\s*\{\s*"@context":\s*"https:\/\/schema\.org",\s*"@type":\s*"WebPage",\s*"@id":\s*"https:\/\/talentxcel\.in#webpage"[\s\S]*?<\/script>\s*/gi, '');

    // 8. Inject Subdomain Structured Data JSON-LD
    const jsonLdScript = `\n<script type="application/ld+json">\n${JSON.stringify(identity.schemaJsonLd, null, 2)}\n</script>\n`;
    html = html.replace('</head>', `${jsonLdScript}</head>`);

    // 9. Inject Semantic Crawlable Content inside body before root
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
