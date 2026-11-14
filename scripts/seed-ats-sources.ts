import { createClient } from '@supabase/supabase-js';

export interface AtsSeedSource {
  provider: 'greenhouse' | 'lever';
  company_name: string;
  board_token: string;
  base_url: string;
  access_basis: 'public_api_terms_reviewed' | 'employer_authorized';
  enabled: boolean;
}

export const CANDIDATE_ATS_SOURCES: AtsSeedSource[] = [
  // Greenhouse Public API Sources
  {
    provider: 'greenhouse',
    company_name: 'GitLab',
    board_token: 'gitlab',
    base_url: 'https://boards-api.greenhouse.io/v1/boards/gitlab/jobs?content=true',
    access_basis: 'public_api_terms_reviewed',
    enabled: true,
  },
  {
    provider: 'greenhouse',
    company_name: 'Stripe',
    board_token: 'stripe',
    base_url: 'https://boards-api.greenhouse.io/v1/boards/stripe/jobs?content=true',
    access_basis: 'public_api_terms_reviewed',
    enabled: true,
  },
  {
    provider: 'greenhouse',
    company_name: 'Twilio',
    board_token: 'twilio',
    base_url: 'https://boards-api.greenhouse.io/v1/boards/twilio/jobs?content=true',
    access_basis: 'public_api_terms_reviewed',
    enabled: true,
  },
  {
    provider: 'greenhouse',
    company_name: 'Affirm',
    board_token: 'affirm',
    base_url: 'https://boards-api.greenhouse.io/v1/boards/affirm/jobs?content=true',
    access_basis: 'public_api_terms_reviewed',
    enabled: true,
  },
  {
    provider: 'greenhouse',
    company_name: 'Rubrik',
    board_token: 'rubrik',
    base_url: 'https://boards-api.greenhouse.io/v1/boards/rubrik/jobs?content=true',
    access_basis: 'public_api_terms_reviewed',
    enabled: true,
  },
  {
    provider: 'greenhouse',
    company_name: 'InMobi',
    board_token: 'inmobi',
    base_url: 'https://boards-api.greenhouse.io/v1/boards/inmobi/jobs?content=true',
    access_basis: 'public_api_terms_reviewed',
    enabled: true,
  },
  {
    provider: 'greenhouse',
    company_name: 'Databricks',
    board_token: 'databricks',
    base_url: 'https://boards-api.greenhouse.io/v1/boards/databricks/jobs?content=true',
    access_basis: 'public_api_terms_reviewed',
    enabled: true,
  },
  {
    provider: 'greenhouse',
    company_name: 'Elastic',
    board_token: 'elastic',
    base_url: 'https://boards-api.greenhouse.io/v1/boards/elastic/jobs?content=true',
    access_basis: 'public_api_terms_reviewed',
    enabled: true,
  },
  {
    provider: 'greenhouse',
    company_name: 'Canonical',
    board_token: 'canonical',
    base_url: 'https://boards-api.greenhouse.io/v1/boards/canonical/jobs?content=true',
    access_basis: 'public_api_terms_reviewed',
    enabled: true,
  },
  {
    provider: 'greenhouse',
    company_name: 'Cloudflare',
    board_token: 'cloudflare',
    base_url: 'https://boards-api.greenhouse.io/v1/boards/cloudflare/jobs?content=true',
    access_basis: 'public_api_terms_reviewed',
    enabled: true,
  },
  {
    provider: 'greenhouse',
    company_name: 'Reddit',
    board_token: 'reddit',
    base_url: 'https://boards-api.greenhouse.io/v1/boards/reddit/jobs?content=true',
    access_basis: 'public_api_terms_reviewed',
    enabled: true,
  },
  {
    provider: 'greenhouse',
    company_name: 'Agoda',
    board_token: 'agoda',
    base_url: 'https://boards-api.greenhouse.io/v1/boards/agoda/jobs?content=true',
    access_basis: 'public_api_terms_reviewed',
    enabled: true,
  },
  {
    provider: 'greenhouse',
    company_name: 'Figma',
    board_token: 'figma',
    base_url: 'https://boards-api.greenhouse.io/v1/boards/figma/jobs?content=true',
    access_basis: 'public_api_terms_reviewed',
    enabled: true,
  },
  // Lever Public API Sources
  {
    provider: 'lever',
    company_name: 'Zeta',
    board_token: 'zeta',
    base_url: 'https://api.lever.co/v0/postings/zeta?mode=json',
    access_basis: 'public_api_terms_reviewed',
    enabled: true,
  },
];

export async function verifyAndSeedAtsSources(supabase: any): Promise<{
  verified: number;
  failed: number;
  seeded: number;
  details: Array<{ name: string; status: number; jobsCount: number; indiaCount: number }>;
}> {
  console.log('📡 Verifying candidate public ATS sources...');
  const details: Array<{ name: string; status: number; jobsCount: number; indiaCount: number }> = [];
  let verified = 0;
  let failed = 0;
  let seeded = 0;

  for (const src of CANDIDATE_ATS_SOURCES) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(src.base_url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const jobs = Array.isArray(data) ? data : (data.jobs || []);
        const indiaJobs = jobs.filter((j: any) => {
          const loc = src.provider === 'greenhouse' ? (j.location?.name || '') : (j.categories?.location || '');
          const title = src.provider === 'greenhouse' ? (j.title || '') : (j.text || '');
          return /india|bengaluru|bangalore|gurgaon|gurugram|mumbai|pune|hyderabad|noida|delhi|remote/i.test(loc + ' ' + title);
        });

        details.push({
          name: src.company_name,
          status: res.status,
          jobsCount: jobs.length,
          indiaCount: indiaJobs.length,
        });

        verified++;

        // Upsert into external_ats_sources
        const { error: upsertErr } = await supabase.from('external_ats_sources').upsert(
          {
            provider: src.provider,
            company_name: src.company_name,
            board_token: src.board_token,
            base_url: src.base_url,
            access_basis: src.access_basis,
            enabled: true,
            last_status: `HTTP ${res.status} OK (${jobs.length} jobs)`,
            last_success_at: new Date().toISOString(),
          },
          { onConflict: 'provider,board_token' }
        );

        if (!upsertErr) {
          seeded++;
        } else {
          console.warn(`Warning: failed to upsert ${src.company_name}:`, upsertErr);
        }
      } else {
        failed++;
        details.push({
          name: src.company_name,
          status: res.status,
          jobsCount: 0,
          indiaCount: 0,
        });
      }
    } catch (err: any) {
      failed++;
      details.push({
        name: src.company_name,
        status: 0,
        jobsCount: 0,
        indiaCount: 0,
      });
    }
  }

  return { verified, failed, seeded, details };
}

// Standalone execution runner
if (process.argv[1] && process.argv[1].endsWith('seed-ats-sources.ts')) {
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  verifyAndSeedAtsSources(supabase)
    .then((res) => {
      console.log('\n================================================================');
      console.log('📡 PUBLIC ATS SOURCES SEEDING TELEMETRY');
      console.log('================================================================');
      console.log(`Verified: ${res.verified} | Failed: ${res.failed} | Seeded: ${res.seeded}`);
      console.table(res.details);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal Seeding Error:', err);
      process.exit(1);
    });
}
