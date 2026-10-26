/**
 * scripts/trigger-indexnow.ts
 * CLI runner for TalentXcel IndexNow Push Engine
 *
 * Usage:
 *   npm run seo:indexnow
 *   npx tsx scripts/trigger-indexnow.ts
 *   npx tsx scripts/trigger-indexnow.ts --limit 100
 */

import handler from '../api/seo/indexnow';

async function main() {
  const args = process.argv.slice(2);
  let limit = '90';
  let urls: string[] | undefined = undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = args[i + 1];
    } else if (args[i].startsWith('--limit=')) {
      limit = args[i].split('=')[1];
    } else if (args[i] === '--urls' && args[i + 1]) {
      urls = args[i + 1].split(',').map((u) => u.trim());
    }
  }

  console.log('🚀 Triggering TalentXcel IndexNow SEO Push Pipeline...\n');

  const mockReq = {
    method: 'GET',
    query: { limit, ...(urls ? { urls: urls.join(',') } : {}) },
    headers: {},
  };

  const mockRes = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    setHeader(k: string, v: string) {
      this.headers[k] = v;
      return this;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      console.log(`[HTTP ${this.statusCode}] IndexNow Dispatch Result:`);
      console.log(JSON.stringify(data, null, 2));
    },
    end() {
      // completed
    },
  };

  await handler(mockReq, mockRes);
}

main().catch((err) => {
  console.error('IndexNow Dispatch Error:', err);
  process.exit(1);
});
