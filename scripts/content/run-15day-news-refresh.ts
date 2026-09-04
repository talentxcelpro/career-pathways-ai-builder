/**
 * TalentXcel — 15-Day Automated Content Freshness & Rewriter Engine
 *
 * Evaluates rolling 15-day refresh cadence across the 20 High-Authority Publications.
 * Generates:
 * 1. public/sitemap-news.xml (Google News XML Sitemap)
 * 2. public/feed/news.xml (RSS 2.0 Feed for aggregators & AI crawlers)
 * 3. public/content/news-freshness-manifest.json (Auditable execution record)
 *
 * Cadence: Rolling 15-day automated execution.
 * Command: npx tsx scripts/content/run-15day-news-refresh.ts
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { FOUNDATION_NEWS_ARTICLES } from '../../src/data/newsArticles';
import { 
  evaluateAndRefreshArticles, 
  ARCHETYPE_CONFIG, 
  CURRENT_PLATFORM_TELEMETRY 
} from '../../src/services/news/newsFreshnessEngine';

export function runNewsFreshnessCycle(forceAll = true) {
  const rootDir = process.cwd();
  const publicDir = resolve(rootDir, 'public');
  const feedDir = resolve(publicDir, 'feed');
  const contentDir = resolve(publicDir, 'content');

  if (!existsSync(feedDir)) mkdirSync(feedDir, { recursive: true });
  if (!existsSync(contentDir)) mkdirSync(contentDir, { recursive: true });

  const now = new Date();
  const result = evaluateAndRefreshArticles(FOUNDATION_NEWS_ARTICLES, forceAll, now);
  const { articles, refreshedCount, totalArticles, lastCycleAt, nextScheduledCycleAt } = result;

  console.log('================================================================');
  console.log('TALENTXCEL 15-DAY HIGH-AUTHORITY PUBLICATION FRESHNESS ENGINE');
  console.log('================================================================');
  console.log(`Executed At: ${lastCycleAt}`);
  console.log(`Total Publications in Suite: ${totalArticles}`);
  console.log(`Publications Refreshed in this Cycle: ${refreshedCount}`);
  console.log(`Next Rolling Freshness Cadence: ${nextScheduledCycleAt}`);
  console.log('----------------------------------------------------------------');

  // 1. Generate Google News & Standard XML Sitemap
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${articles.map(art => {
  const publishedIso = new Date(art.publishedAt).toISOString();
  const updatedIso = art.updatedAt ? new Date(art.updatedAt).toISOString() : publishedIso;
  const safeTitle = art.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `  <url>
    <loc>https://talentxcel.in/news/${art.slug}</loc>
    <lastmod>${updatedIso.split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
    <news:news>
      <news:publication>
        <news:name>TalentXcel News &amp; Career Intelligence</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${publishedIso}</news:publication_date>
      <news:title>${safeTitle}</news:title>
    </news:news>
  </url>`;
}).join('\n')}
</urlset>`;

  writeFileSync(resolve(publicDir, 'sitemap-news.xml'), sitemapXml, 'utf8');
  console.log(`[OK] Generated public/sitemap-news.xml (${articles.length} publications with <news:news> schemas)`);

  // 2. Generate Google News / RSS 2.0 Feed
  const rfc822Now = now.toUTCString();
  const rssFeedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>TalentXcel News &amp; Career Intelligence</title>
    <link>https://talentxcel.in/news</link>
    <description>First-party company announcements, empirical hiring demand trends, higher education insights, and platform benchmarks.</description>
    <language>en-US</language>
    <lastBuildDate>${rfc822Now}</lastBuildDate>
    <atom:link href="https://talentxcel.in/feed/news.xml" rel="self" type="application/rss+xml"/>
${articles.map(art => {
  const itemDate = new Date(art.publishedAt).toUTCString();
  const safeTitle = art.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeSummary = art.summary.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `    <item>
      <title>${safeTitle}</title>
      <link>https://talentxcel.in/news/${art.slug}</link>
      <guid isPermaLink="true">https://talentxcel.in/news/${art.slug}</guid>
      <pubDate>${itemDate}</pubDate>
      <description>${safeSummary}</description>
      <category>${art.archetype || art.category}</category>
      <dc:creator>${art.author?.name || 'TalentXcel Editorial Desk'}</dc:creator>
    </item>`;
}).join('\n')}
  </channel>
</rss>`;

  writeFileSync(resolve(feedDir, 'news.xml'), rssFeedXml, 'utf8');
  console.log(`[OK] Generated public/feed/news.xml (RSS 2.0 feed with ${articles.length} items)`);

  // 3. Generate Auditable Freshness Manifest
  const manifest = {
    generatedAt: lastCycleAt,
    nextScheduledCycleAt,
    cadenceDays: 15,
    totalPublications: totalArticles,
    refreshedPublications: refreshedCount,
    telemetrySnapshot: CURRENT_PLATFORM_TELEMETRY,
    archetypeDistribution: {
      sectorReports: articles.filter(a => a.archetype === 'Sector Report').length,
      careerGuides: articles.filter(a => a.archetype === 'Career Guide').length,
      industryInsiders: articles.filter(a => a.archetype === 'Industry Insider').length,
      professionalJournals: articles.filter(a => a.archetype === 'Professional Journal').length,
      tradePublications: articles.filter(a => a.archetype === 'Trade Publication').length,
    },
    publications: articles.map(a => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      archetype: a.archetype,
      category: a.category,
      editionVersion: a.editionVersion,
      lastRefreshedAt: a.lastRefreshedAt,
      cadenceDays: a.refreshCadenceDays || 15,
    }))
  };

  writeFileSync(resolve(contentDir, 'news-freshness-manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`[OK] Generated public/content/news-freshness-manifest.json (Auditable manifest)`);

  console.log('----------------------------------------------------------------');
  console.log('ARCHETYPE DISTRIBUTION:');
  console.log(`   - Sector Reports         : ${manifest.archetypeDistribution.sectorReports}`);
  console.log(`   - Career Guides          : ${manifest.archetypeDistribution.careerGuides}`);
  console.log(`   - Industry Insiders      : ${manifest.archetypeDistribution.industryInsiders}`);
  console.log(`   - Professional Journals  : ${manifest.archetypeDistribution.professionalJournals}`);
  console.log(`   - Trade Publications     : ${manifest.archetypeDistribution.tradePublications}`);
  console.log('================================================================');

  return manifest;
}

runNewsFreshnessCycle(true);
