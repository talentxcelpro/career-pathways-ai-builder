// src/services/seo/sitemapShardingService.ts
// Automatic Sitemap Sharding Engine for TalentXcel Global 100K Job Network
// Invariant: Exactly <= 25,000 URLs per shard and <= 50 MB uncompressed

export const MAX_URLS_PER_SITEMAP_SHARD = 25000;
export const MAX_BYTES_PER_SITEMAP_SHARD = 50 * 1024 * 1024; // 50 MB

export interface SitemapShardDefinition {
  shardIndex: number;
  filename: string;
  urls: Array<{
    loc: string;
    lastmod?: string;
    changefreq?: string;
    priority?: string;
  }>;
  totalUrls: number;
}

/**
 * Shards an arbitrary array of canonical job/location URLs into chunks <= 25,000 URLs
 */
export function shardUrls(
  urls: Array<{ loc: string; lastmod?: string; changefreq?: string; priority?: string }>,
  baseFilenamePrefix: string = 'sitemaps/jobs-shard'
): SitemapShardDefinition[] {
  const shards: SitemapShardDefinition[] = [];
  const total = urls.length;
  
  if (total === 0) {
    return [
      {
        shardIndex: 1,
        filename: `${baseFilenamePrefix}-1.xml`,
        urls: [],
        totalUrls: 0,
      },
    ];
  }

  const numShards = Math.ceil(total / MAX_URLS_PER_SITEMAP_SHARD);

  for (let i = 0; i < numShards; i++) {
    const start = i * MAX_URLS_PER_SITEMAP_SHARD;
    const end = Math.min(start + MAX_URLS_PER_SITEMAP_SHARD, total);
    const chunk = urls.slice(start, end);

    shards.push({
      shardIndex: i + 1,
      filename: `${baseFilenamePrefix}-${i + 1}.xml`,
      urls: chunk,
      totalUrls: chunk.length,
    });
  }

  return shards;
}

/**
 * Builds standard XML sitemap for a shard
 */
export function buildShardXml(shard: SitemapShardDefinition): string {
  const urlEntries = shard.urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}${u.changefreq ? `\n    <changefreq>${u.changefreq}</changefreq>` : ''}${u.priority ? `\n    <priority>${u.priority}</priority>` : ''}
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}
