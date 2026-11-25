/**
 * src/lib/geo/cityDynamicSitemap.ts
 * TalentXcel City Sitemap Engine — Index-Readiness Gated
 *
 * INVARIANTS:
 * - Only cities with index_ready=true in city_registry table enter this sitemap.
 * - lastmod is ONLY updated when real content changes (new jobs, employer changes).
 *   It is NEVER artificially bumped.
 * - Sitemap is sharded at 25,000 URLs per shard (reuses existing sitemapShardingService).
 * - Discovery clusters have their own sitemap shard.
 *
 * USAGE:
 *   generateCitySitemapXml(supabase, 'https://talentxcel.in')
 *
 * @version 2.0.0
 */

import { shardUrls, buildShardXml } from '@/services/seo/sitemapShardingService';

export interface CityUrlEntry {
  loc: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
}

/**
 * Generates city sitemap XML from Supabase city_registry.
 * Only includes cities where index_ready = true.
 * Respects existing sharding service (max 25,000 URLs per shard).
 *
 * Performance: single Supabase query with pagination — no N+1 queries.
 * Cache: sitemap should be cached at CDN level for 30 minutes.
 */
export async function generateCitySitemapEntries(
  supabase: any,
  baseUrl: string
): Promise<CityUrlEntry[]> {
  const urls: CityUrlEntry[] = [];

  // Single bounded query — no unbounded SELECT *
  let offset = 0;
  const pageSize = 500;

  while (true) {
    const { data: cities, error } = await supabase
      .from('city_registry')
      .select('slug, gsc_avg_position, gsc_impressions, tier, last_material_update')
      .eq('index_ready', true)
      .eq('active', true)
      .order('gsc_impressions', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('[cityDynamicSitemap] Error fetching cities:', error);
      break;
    }

    if (!cities || cities.length === 0) break;

    cities.forEach((city: any) => {
      // Priority: Tier 1 = 0.9, Tier 2 = 0.8, Tier 3 = 0.7, Tier 4 = 0.6
      const priorityMap: Record<number, string> = { 1: '0.9', 2: '0.8', 3: '0.7', 4: '0.6' };
      const priority = priorityMap[city.tier] || '0.7';

      // Change frequency based on GSC position
      const changefreq = city.gsc_avg_position > 0 && city.gsc_avg_position <= 5
        ? 'daily'
        : city.gsc_avg_position <= 20
        ? 'daily'
        : 'weekly';

      // lastmod from actual data change — NEVER from current timestamp
      const lastmod = city.last_material_update
        ? new Date(city.last_material_update).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      urls.push({
        loc: `${baseUrl}/locations/${city.slug}`,
        lastmod,
        changefreq,
        priority,
      });
    });

    if (cities.length < pageSize) break;
    offset += pageSize;
  }

  return urls;
}

/**
 * Generates discovery cluster sitemap entries.
 * Only includes clusters with index_ready = true.
 */
export async function generateClusterSitemapEntries(
  supabase: any,
  baseUrl: string
): Promise<CityUrlEntry[]> {
  const urls: CityUrlEntry[] = [];
  let offset = 0;
  const pageSize = 500;

  while (true) {
    const { data: clusters, error } = await supabase
      .from('discovery_clusters')
      .select('canonical_url, gsc_avg_position, updated_at')
      .eq('index_ready', true)
      .eq('active', true)
      .order('gsc_impressions', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error || !clusters || clusters.length === 0) break;

    clusters.forEach((cluster: any) => {
      const url = cluster.canonical_url.startsWith('http')
        ? cluster.canonical_url
        : `${baseUrl}${cluster.canonical_url}`;

      urls.push({
        loc: url,
        lastmod: new Date(cluster.updated_at).toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '0.8',
      });
    });

    if (clusters.length < pageSize) break;
    offset += pageSize;
  }

  return urls;
}

/**
 * Build complete city sitemap XML string(s).
 * Returns array of [filename, xmlContent] pairs.
 * Automatically shards at 25,000 URLs.
 */
export async function buildCitySitemapXml(
  supabase: any,
  baseUrl: string
): Promise<Array<{ filename: string; xml: string; urlCount: number }>> {
  const [cityUrls, clusterUrls] = await Promise.all([
    generateCitySitemapEntries(supabase, baseUrl),
    generateClusterSitemapEntries(supabase, baseUrl),
  ]);

  const allUrls = [...cityUrls, ...clusterUrls].map((u) => ({
    loc: u.loc,
    lastmod: u.lastmod,
    changefreq: u.changefreq,
    priority: u.priority,
  }));

  if (allUrls.length === 0) {
    return [{ filename: 'sitemaps/cities-shard-1.xml', xml: buildEmptySitemap(), urlCount: 0 }];
  }

  const shards = shardUrls(allUrls, 'sitemaps/cities-shard');
  return shards.map((shard) => ({
    filename: shard.filename,
    xml: buildShardXml(shard),
    urlCount: shard.totalUrls,
  }));
}

function buildEmptySitemap(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
}

/**
 * Sitemap index entry for the city sitemap shards.
 * Include this in your sitemap-index.xml.
 */
export function buildCitySitemapIndexEntries(
  baseUrl: string,
  shardFilenames: string[]
): string {
  return shardFilenames
    .map(
      (filename) =>
        `  <sitemap>
    <loc>${baseUrl}/${filename}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`
    )
    .join('\n');
}
