interface HostAuditResult {
  host: string;
  status: number;
  title: string;
  description: string;
  canonical: string;
  robotsMeta: string;
  h1: string;
  schemaTypes: string[];
  robotsTxtStatus: number;
  robotsTxtSitemapDeclared: string;
  sitemapStatus: number;
  sitemapXmlValid: boolean;
  sitemapUrlCount: number;
  sitemapHostViolations: number;
  sampleDetailUrl?: string;
  sampleDetailStatus?: number;
}

const HOSTS = [
  { host: 'jobs.talentxcel.in', samplePath: '/jobs' },
  { host: 'salary.talentxcel.in', samplePath: '/salary' },
  { host: 'careers.talentxcel.in', samplePath: '/career-map' },
  { host: 'resume.talentxcel.in', samplePath: '/resume' },
  { host: 'learning.talentxcel.in', samplePath: '/learning' },
  { host: 'colleges.talentxcel.in', samplePath: '/colleges' },
  { host: 'employers.talentxcel.in', samplePath: '/recruiters' },
  { host: 'government.talentxcel.in', samplePath: '/government-jobs' },
  { host: 'passport.talentxcel.in', samplePath: '/passport' },
  { host: 'talentxcel.in', samplePath: '/network' },
];

async function runAudit() {
  console.log('================================================================');
  console.log('🔍 TALENTXCEL PHASE 1: NINE INDEPENDENT HOSTS COMPREHENSIVE AUDIT');
  console.log('================================================================\n');

  const results: HostAuditResult[] = [];

  for (const { host, samplePath } of HOSTS) {
    const origin = `https://${host}`;
    console.log(`Auditing ${host}...`);

    let status = 0;
    let title = 'None';
    let description = 'None';
    let canonical = 'None';
    let robotsMeta = 'None';
    let h1 = 'None';
    const schemaTypes: string[] = [];

    // 1. Audit Homepage HTML
    try {
      const res = await fetch(`${origin}/`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }
      });
      status = res.status;
      const html = await res.text();

      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      if (titleMatch) title = titleMatch[1].trim();

      const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
      if (descMatch) description = descMatch[1].trim();

      const canonMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i) ||
                         html.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i);
      if (canonMatch) canonical = canonMatch[1].trim();

      const robMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i);
      if (robMatch) robotsMeta = robMatch[1].trim();

      const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
      if (h1Match) h1 = h1Match[1].trim();

      // Extract JSON-LD schemas
      const jsonLdMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
      for (const m of jsonLdMatches) {
        try {
          const parsed = JSON.parse(m[1]);
          if (parsed['@type']) {
            schemaTypes.push(Array.isArray(parsed['@type']) ? parsed['@type'].join(', ') : parsed['@type']);
          } else if (Array.isArray(parsed)) {
            parsed.forEach((p) => { if (p['@type']) schemaTypes.push(p['@type']); });
          }
        } catch {
          // ignore parsing error
        }
      }
    } catch (err: any) {
      console.error(`  [!] Error fetching homepage: ${err.message}`);
    }

    // 2. Audit robots.txt
    let robotsTxtStatus = 0;
    let robotsTxtSitemapDeclared = 'None';
    try {
      const res = await fetch(`${origin}/robots.txt`);
      robotsTxtStatus = res.status;
      if (res.ok) {
        const text = await res.text();
        const smMatch = text.match(/Sitemap:\s*(https?:\/\/[^\s]+)/i);
        if (smMatch) robotsTxtSitemapDeclared = smMatch[1].trim();
      }
    } catch (err: any) {
      console.error(`  [!] Error fetching robots.txt: ${err.message}`);
    }

    // 3. Audit sitemap.xml
    let sitemapStatus = 0;
    let sitemapXmlValid = false;
    let sitemapUrlCount = 0;
    let sitemapHostViolations = 0;
    try {
      const res = await fetch(`${origin}/sitemap.xml`);
      sitemapStatus = res.status;
      if (res.ok) {
        const xmlText = await res.text();
        if (xmlText.includes('<?xml') && (xmlText.includes('<urlset') || xmlText.includes('<sitemapindex'))) {
          sitemapXmlValid = true;
          const locMatches = [...xmlText.matchAll(/<loc>([^<]+)<\/loc>/gi)];
          sitemapUrlCount = locMatches.length;
          locMatches.forEach((m) => {
            const loc = m[1].trim();
            try {
              const parsedUrl = new URL(loc);
              if (parsedUrl.hostname !== host) {
                sitemapHostViolations++;
              }
            } catch {
              sitemapHostViolations++;
            }
          });
        }
      }
    } catch (err: any) {
      console.error(`  [!] Error fetching sitemap.xml: ${err.message}`);
    }

    // 4. Audit sample detail page
    let sampleDetailStatus = 0;
    try {
      const res = await fetch(`${origin}${samplePath}`);
      sampleDetailStatus = res.status;
    } catch (err: any) {
      console.error(`  [!] Error fetching sample detail: ${err.message}`);
    }

    const auditItem: HostAuditResult = {
      host,
      status,
      title,
      description,
      canonical,
      robotsMeta,
      h1,
      schemaTypes,
      robotsTxtStatus,
      robotsTxtSitemapDeclared,
      sitemapStatus,
      sitemapXmlValid,
      sitemapUrlCount,
      sitemapHostViolations,
      sampleDetailUrl: `${origin}${samplePath}`,
      sampleDetailStatus,
    };

    results.push(auditItem);
    console.log(`  -> Homepage HTTP: ${status} | Title: "${title}"`);
    console.log(`  -> Canonical: ${canonical}`);
    console.log(`  -> Robots.txt: HTTP ${robotsTxtStatus} | Sitemap declared: ${robotsTxtSitemapDeclared}`);
    console.log(`  -> Sitemap.xml: HTTP ${sitemapStatus} | Valid: ${sitemapXmlValid} | URLs: ${sitemapUrlCount} | Violations: ${sitemapHostViolations}`);
    console.log(`  -> Sample detail (${samplePath}): HTTP ${sampleDetailStatus}\n`);
  }

  // Save audit artifact
  const fs = await import('fs');
  fs.writeFileSync('nine_hosts_audit_baseline.json', JSON.stringify(results, null, 2));
  console.log('✅ Audit saved to nine_hosts_audit_baseline.json');
}

runAudit().catch(console.error);
