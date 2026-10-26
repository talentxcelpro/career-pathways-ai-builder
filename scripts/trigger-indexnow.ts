/**
 * scripts/trigger-indexnow.ts
 * CLI runner for TalentXcel Enterprise IndexNow Mesh Engine
 *
 * Usage:
 *   npm run seo:indexnow
 *   npx tsx scripts/trigger-indexnow.ts --dryRun --sample
 *   npx tsx scripts/trigger-indexnow.ts --page 1 --limit 1000 --sample
 *   npx tsx scripts/trigger-indexnow.ts --google
 */

import handler from '../api/seo/indexnow';

async function main() {
  const args = process.argv.slice(2);
  let limit = '1000';
  let page = '1';
  let urls: string[] | undefined = undefined;
  let dryRun = false;
  let sample = true;
  let google = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = args[i + 1];
    } else if (args[i].startsWith('--limit=')) {
      limit = args[i].split('=')[1];
    } else if (args[i] === '--page' && args[i + 1]) {
      page = args[i + 1];
    } else if (args[i].startsWith('--page=')) {
      page = args[i].split('=')[1];
    } else if (args[i] === '--urls' && args[i + 1]) {
      urls = args[i + 1].split(',').map((u) => u.trim());
    } else if (args[i] === '--dryRun' || args[i] === '--dry-run') {
      dryRun = true;
    } else if (args[i] === '--sample') {
      sample = true;
    } else if (args[i] === '--no-sample') {
      sample = false;
    } else if (args[i] === '--google') {
      google = true;
    }
  }

  console.log('🚀 Triggering TalentXcel 1,000,000-URL IndexNow Push Pipeline...');
  console.log(`Config: page=${page}, limit=${limit}, dryRun=${dryRun}, sample=${sample}, google=${google}\n`);

  const mockReq = {
    method: 'GET',
    query: {
      limit,
      page,
      dryRun: dryRun ? 'true' : 'false',
      sample: sample ? 'true' : 'false',
      google: google ? 'true' : 'false',
      ...(urls ? { urls: urls.join(',') } : {}),
    },
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
