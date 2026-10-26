/**
 * scripts/trigger-indexnow.ts
 * Automated Multi-Page Runner for TalentXcel Enterprise IndexNow Mesh Engine
 *
 * Usage:
 *   npm run seo:indexnow
 *   npx tsx scripts/trigger-indexnow.ts --all
 *   npx tsx scripts/trigger-indexnow.ts --remote --all
 *   npx tsx scripts/trigger-indexnow.ts --dryRun --sample
 *   npx tsx scripts/trigger-indexnow.ts --page 1 --limit 50000
 *   npx tsx scripts/trigger-indexnow.ts --google
 */

import handler from '../api/seo/indexnow';

interface IndexNowResponse {
  success: boolean;
  message?: string;
  error?: string;
  host: string;
  page: number;
  pageSize: number;
  totalUrlsInPage: number;
  hasNextPage: boolean;
  nextPage: number | null;
  nextPageUrl?: string | null;
  totalInventoryCount: number;
  totalBatches: number;
  successfulBatches?: number;
  failedBatches?: number;
  batches?: any[];
  sampleUrls?: string[];
  googleIndexing?: any;
}

async function invokeInProcess(query: Record<string, string>): Promise<IndexNowResponse> {
  return new Promise((resolve, reject) => {
    let capturedData: any = null;
    let statusCode = 200;

    const mockReq: any = {
      method: 'GET',
      query,
      headers: {},
    };

    const mockRes: any = {
      headers: {} as Record<string, string>,
      setHeader(k: string, v: string) {
        this.headers[k] = v;
        return this;
      },
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        capturedData = data;
        if (statusCode >= 400 && !data.success) {
          resolve(data);
        } else {
          resolve(data);
        }
      },
      end() {
        resolve(capturedData || { success: true });
      },
    };

    handler(mockReq, mockRes).catch(reject);
  });
}

async function invokeRemote(baseUrl: string, query: Record<string, string>): Promise<IndexNowResponse> {
  const url = new URL(`${baseUrl}/api/seo/indexnow`);
  Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'User-Agent': 'TalentXcel-Automation-Runner/2.0',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Remote HTTP ${res.status}: ${text}`);
  }

  return (await res.json()) as IndexNowResponse;
}

async function main() {
  const args = process.argv.slice(2);
  let limit = '50000';
  let startPage = '1';
  let urls: string[] | undefined = undefined;
  let dryRun = false;
  let sample = true;
  let google = false;
  let followAll = false;
  let remoteOrigin: string | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = args[i + 1];
    } else if (args[i].startsWith('--limit=')) {
      limit = args[i].split('=')[1];
    } else if (args[i] === '--page' && args[i + 1]) {
      startPage = args[i + 1];
    } else if (args[i].startsWith('--page=')) {
      startPage = args[i].split('=')[1];
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
    } else if (args[i] === '--all') {
      followAll = true;
    } else if (args[i] === '--remote') {
      remoteOrigin = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : 'https://talentxcel.in';
    } else if (args[i].startsWith('--remote=')) {
      remoteOrigin = args[i].split('=')[1];
    }
  }

  console.log('🚀 TalentXcel Enterprise IndexNow Mesh Dispatch Runner');
  console.log(`Execution Mode: ${remoteOrigin ? `Remote Endpoint (${remoteOrigin})` : 'In-Process Serverless Function'}`);
  console.log(`Parameters: startPage=${startPage}, limit=${limit}, dryRun=${dryRun}, followAll=${followAll}, google=${google}\n`);

  let currentPage: number | null = Math.max(1, parseInt(startPage, 10));
  let totalProcessedUrls = 0;
  let pageCount = 0;

  while (currentPage !== null) {
    pageCount++;
    const queryPayload: Record<string, string> = {
      page: String(currentPage),
      limit,
      dryRun: dryRun ? 'true' : 'false',
      sample: sample ? 'true' : 'false',
      google: google ? 'true' : 'false',
      ...(urls ? { urls: urls.join(',') } : {}),
    };

    const startTime = Date.now();
    const data: IndexNowResponse = remoteOrigin
      ? await invokeRemote(remoteOrigin, queryPayload)
      : await invokeInProcess(queryPayload);
    const duration = Date.now() - startTime;

    if (!data.success) {
      console.error(`❌ Dispatch failed on Page ${currentPage}:`, data.error || data);
      throw new Error(`Dispatch failed on page ${currentPage}`);
    }

    totalProcessedUrls += data.totalUrlsInPage;
    console.log(
      `✓ [Page ${data.page}] Dispatched ${data.totalUrlsInPage.toLocaleString()} URLs (Inventory: ${data.totalInventoryCount.toLocaleString()}) across ${data.totalBatches} batch(es) in ${duration}ms [Status: OK]`
    );

    if (data.sampleUrls && data.sampleUrls.length > 0 && sample) {
      console.log(`  Sample: ${data.sampleUrls[0]} ... (${data.sampleUrls.length} samples)`);
    }

    if (data.googleIndexing) {
      console.log(`  Google Indexing API: ${data.googleIndexing.submitted} URLs submitted (${data.googleIndexing.status})`);
    }

    if (followAll && data.hasNextPage) {
      if (typeof data.nextPage === 'number') {
        currentPage = data.nextPage;
      } else if (typeof data.nextPage === 'string') {
        const match = (data.nextPage as string).match(/page=(\d+)/);
        currentPage = match ? parseInt(match[1], 10) : data.page + 1;
      } else {
        currentPage = data.page + 1;
      }
    } else {
      currentPage = null;
    }
  }

  console.log(`\n🎉 Completed IndexNow Dispatch Pipeline!`);
  console.log(`Total Pages Dispatched: ${pageCount}`);
  console.log(`Total Programmatic URLs Processed: ${totalProcessedUrls.toLocaleString()}`);
}

main().catch((err) => {
  console.error('Fatal Runner Error:', err);
  process.exit(1);
});
