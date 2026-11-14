import { getSupabaseAdminClient } from './ingest-ats-jobs';

interface CandidateSource {
  provider: 'greenhouse' | 'lever' | 'smartrecruiters' | 'ashby';
  token: string;
  companyName: string;
}

export const CANDIDATE_REGISTRY: CandidateSource[] = [
  // ── SmartRecruiters Candidates ──
  { provider: 'smartrecruiters', token: 'swiggy', companyName: 'Swiggy' },
  { provider: 'smartrecruiters', token: 'freshworks', companyName: 'Freshworks' },
  { provider: 'smartrecruiters', token: 'servicenow', companyName: 'ServiceNow' },
  { provider: 'smartrecruiters', token: 'canva', companyName: 'Canva' },
  { provider: 'smartrecruiters', token: 'grab', companyName: 'Grab' },
  { provider: 'smartrecruiters', token: 'cars24', companyName: 'Cars24' },
  { provider: 'smartrecruiters', token: 'unacademy', companyName: 'Unacademy' },
  { provider: 'smartrecruiters', token: 'uber', companyName: 'Uber' },
  { provider: 'smartrecruiters', token: 'bosch', companyName: 'Bosch' },
  { provider: 'smartrecruiters', token: 'ikea', companyName: 'IKEA' },
  { provider: 'smartrecruiters', token: 'siemens', companyName: 'Siemens' },
  { provider: 'smartrecruiters', token: 'schneider-electric', companyName: 'Schneider Electric' },
  { provider: 'smartrecruiters', token: 'abb', companyName: 'ABB' },
  { provider: 'smartrecruiters', token: 'alstom', companyName: 'Alstom' },
  { provider: 'smartrecruiters', token: 'honeywell', companyName: 'Honeywell' },
  { provider: 'smartrecruiters', token: 'philips', companyName: 'Philips' },
  { provider: 'smartrecruiters', token: 'ge', companyName: 'General Electric' },
  { provider: 'smartrecruiters', token: 'palantir', companyName: 'Palantir Technologies' },
  { provider: 'smartrecruiters', token: 'visa', companyName: 'Visa' },
  { provider: 'smartrecruiters', token: 'publicissapient', companyName: 'Publicis Sapient' },

  // ── Ashby Candidates ──
  { provider: 'ashby', token: 'snowflake', companyName: 'Snowflake' },
  { provider: 'ashby', token: 'notion', companyName: 'Notion' },
  { provider: 'ashby', token: 'snyk', companyName: 'Snyk' },
  { provider: 'ashby', token: 'linear', companyName: 'Linear' },
  { provider: 'ashby', token: 'replit', companyName: 'Replit' },
  { provider: 'ashby', token: 'perplexity', companyName: 'Perplexity AI' },
  { provider: 'ashby', token: 'ramp', companyName: 'Ramp' },
  { provider: 'ashby', token: 'duolingo', companyName: 'Duolingo' },
  { provider: 'ashby', token: 'openai', companyName: 'OpenAI' },
  { provider: 'ashby', token: 'wiz', companyName: 'Wiz' },
  { provider: 'ashby', token: 'postman', companyName: 'Postman' },
  { provider: 'ashby', token: 'deel', companyName: 'Deel' },
  { provider: 'ashby', token: 'remote', companyName: 'Remote' },
  { provider: 'ashby', token: 'airwallex', companyName: 'Airwallex' },
  { provider: 'ashby', token: 'scaleai', companyName: 'Scale AI' },
  { provider: 'ashby', token: 'brex', companyName: 'Brex' },

  // ── Lever Candidates ──
  { provider: 'lever', token: 'cred', companyName: 'CRED' },
  { provider: 'lever', token: 'meesho', companyName: 'Meesho' },
  { provider: 'lever', token: 'paytm', companyName: 'Paytm' },
  { provider: 'lever', token: 'palantir', companyName: 'Palantir' },
  { provider: 'lever', token: 'atlassian', companyName: 'Atlassian' },
  { provider: 'lever', token: 'spinny', companyName: 'Spinny' },
  { provider: 'lever', token: 'urbancompany', companyName: 'Urban Company' },
  { provider: 'lever', token: 'rapido', companyName: 'Rapido' },
  { provider: 'lever', token: 'clear', companyName: 'Clear (ClearTax)' },
  { provider: 'lever', token: 'jupiter', companyName: 'Jupiter Money' },
  { provider: 'lever', token: 'fi-money', companyName: 'Fi Money' },
  { provider: 'lever', token: 'smallcase', companyName: 'smallcase' },
  { provider: 'lever', token: 'khatabook', companyName: 'Khatabook' },
  { provider: 'lever', token: 'mpl', companyName: 'Mobile Premier League (MPL)' },
  { provider: 'lever', token: 'lead', companyName: 'LEAD School' },
  { provider: 'lever', token: 'pocketaces', companyName: 'Pocket Aces' },
  { provider: 'lever', token: 'loco', companyName: 'Loco' },
  { provider: 'lever', token: 'curefit', companyName: 'cult.fit' },
  { provider: 'lever', token: 'jar', companyName: 'Jar App' },
  { provider: 'lever', token: 'slice', companyName: 'Slice' },

  // ── Greenhouse Candidates ──
  { provider: 'greenhouse', token: 'inmobi', companyName: 'InMobi' },
  { provider: 'greenhouse', token: 'groww', companyName: 'Groww' },
  { provider: 'greenhouse', token: 'druva', companyName: 'Druva' },
  { provider: 'greenhouse', token: 'airbnb', companyName: 'Airbnb' },
  { provider: 'greenhouse', token: 'stripe', companyName: 'Stripe' },
  { provider: 'greenhouse', token: 'figma', companyName: 'Figma' },
  { provider: 'greenhouse', token: 'airtable', companyName: 'Airtable' },
  { provider: 'greenhouse', token: 'datadog', companyName: 'Datadog' },
  { provider: 'greenhouse', token: 'gitlab', companyName: 'GitLab' },
  { provider: 'greenhouse', token: 'twilio', companyName: 'Twilio' },
  { provider: 'greenhouse', token: 'cloudflare', companyName: 'Cloudflare' },
  { provider: 'greenhouse', token: 'mongodb', companyName: 'MongoDB' },
  { provider: 'greenhouse', token: 'elastic', companyName: 'Elastic' },
  { provider: 'greenhouse', token: 'zscaler', companyName: 'Zscaler' },
  { provider: 'greenhouse', token: 'okta', companyName: 'Okta' },
  { provider: 'greenhouse', token: 'tcs', companyName: 'TCS' },
  { provider: 'greenhouse', token: 'razorpay', companyName: 'Razorpay' },
  { provider: 'greenhouse', token: 'postman', companyName: 'Postman' },
  { provider: 'greenhouse', token: 'browserstack', companyName: 'BrowserStack' },
  { provider: 'greenhouse', token: 'phonepe', companyName: 'PhonePe' },
  { provider: 'greenhouse', token: 'zepto', companyName: 'Zepto' },
  { provider: 'greenhouse', token: 'blinkit', companyName: 'Blinkit' },
  { provider: 'greenhouse', token: 'chargebee', companyName: 'Chargebee' },
  { provider: 'greenhouse', token: 'clevertap', companyName: 'CleverTap' },
  { provider: 'greenhouse', token: 'hasura', companyName: 'Hasura' },
  { provider: 'greenhouse', token: 'dream11', companyName: 'Dream11' },
  { provider: 'greenhouse', token: 'games24x7', companyName: 'Games24x7' },
  { provider: 'greenhouse', token: 'upgrad', companyName: 'upGrad' },
  { provider: 'greenhouse', token: 'eruditus', companyName: 'Eruditus' },
  { provider: 'greenhouse', token: 'lenskart', companyName: 'Lenskart' },
  { provider: 'greenhouse', token: 'confluent', companyName: 'Confluent' },
  { provider: 'greenhouse', token: 'hashicorp', companyName: 'HashiCorp' },
  { provider: 'greenhouse', token: 'splunk', companyName: 'Splunk' },
  { provider: 'greenhouse', token: 'dynatrace', companyName: 'Dynatrace' },
  { provider: 'greenhouse', token: 'nutanix', companyName: 'Nutanix' },
  { provider: 'greenhouse', token: 'paloaltonetworks', companyName: 'Palo Alto Networks' },
  { provider: 'greenhouse', token: 'crowdstrike', companyName: 'CrowdStrike' },
  { provider: 'greenhouse', token: 'auth0', companyName: 'Auth0' },
  { provider: 'greenhouse', token: 'sentinelone', companyName: 'SentinelOne' },
  { provider: 'greenhouse', token: 'accenture', companyName: 'Accenture' },
  { provider: 'greenhouse', token: 'capgemini', companyName: 'Capgemini' },
  { provider: 'greenhouse', token: 'cognizant', companyName: 'Cognizant' },
  { provider: 'greenhouse', token: 'infosys', companyName: 'Infosys' },
  { provider: 'greenhouse', token: 'wipro', companyName: 'Wipro' },
  { provider: 'greenhouse', token: 'techmahindra', companyName: 'Tech Mahindra' },
  { provider: 'greenhouse', token: 'mphasis', companyName: 'Mphasis' },
  { provider: 'greenhouse', token: 'persistent', companyName: 'Persistent Systems' },
  { provider: 'greenhouse', token: 'birlasoft', companyName: 'Birlasoft' },
  { provider: 'greenhouse', token: 'kpit', companyName: 'KPIT' },
  { provider: 'greenhouse', token: 'cyient', companyName: 'Cyient' },
  { provider: 'greenhouse', token: 'tataelxsi', companyName: 'Tata Elxsi' },
  { provider: 'greenhouse', token: 'coforge', companyName: 'Coforge' },
  { provider: 'greenhouse', token: 'hexaware', companyName: 'Hexaware' },
  { provider: 'greenhouse', token: 'uber', companyName: 'Uber' },
  { provider: 'greenhouse', token: 'atlassian', companyName: 'Atlassian' },
  { provider: 'greenhouse', token: 'salesforce', companyName: 'Salesforce' },
  { provider: 'greenhouse', token: 'intuit', companyName: 'Intuit' },
  { provider: 'greenhouse', token: 'adobe', companyName: 'Adobe' },
  { provider: 'greenhouse', token: 'autodesk', companyName: 'Autodesk' },
  { provider: 'greenhouse', token: 'synopsys', companyName: 'Synopsys' },
  { provider: 'greenhouse', token: 'cadence', companyName: 'Cadence' },
  { provider: 'greenhouse', token: 'qualcomm', companyName: 'Qualcomm' },
  { provider: 'greenhouse', token: 'broadcom', companyName: 'Broadcom' },
  { provider: 'greenhouse', token: 'nvidia', companyName: 'NVIDIA' },
  { provider: 'greenhouse', token: 'amd', companyName: 'AMD' },
  { provider: 'greenhouse', token: 'intel', companyName: 'Intel' },
  { provider: 'greenhouse', token: 'cisco', companyName: 'Cisco' },
  { provider: 'greenhouse', token: 'juniper', companyName: 'Juniper Networks' },
  { provider: 'greenhouse', token: 'arista', companyName: 'Arista Networks' },
  { provider: 'greenhouse', token: 'vmware', companyName: 'VMware' }
];

export function getProviderBaseUrl(provider: string, token: string): string {
  switch (provider) {
    case 'greenhouse':
      return `https://boards-api.greenhouse.io/v1/boards/${token}/jobs`;
    case 'lever':
      return `https://api.lever.co/v0/postings/${token}?mode=json`;
    case 'smartrecruiters':
      return `https://api.smartrecruiters.com/v1/companies/${token}/postings?limit=100`;
    case 'ashby':
      return `https://api.ashbyhq.com/posting-api/job-board/${token}`;
    default:
      return '';
  }
}

export async function probeCandidate(candidate: CandidateSource): Promise<{
  candidate: CandidateSource;
  isValid: boolean;
  totalJobs: number;
  indiaJobs: number;
  baseUrl: string;
}> {
  const baseUrl = getProviderBaseUrl(candidate.provider, candidate.token);
  const result = { candidate, isValid: false, totalJobs: 0, indiaJobs: 0, baseUrl };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(baseUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return result;

    const data = await res.json();
    let rawList: any[] = [];
    if (candidate.provider === 'greenhouse') {
      rawList = data.jobs || [];
    } else if (candidate.provider === 'lever') {
      rawList = Array.isArray(data) ? data : [];
    } else if (candidate.provider === 'smartrecruiters') {
      rawList = data.content || [];
    } else if (candidate.provider === 'ashby') {
      rawList = data.jobs || [];
    }

    result.totalJobs = rawList.length;
    if (result.totalJobs === 0) return result;

    const indiaCandidates = rawList.filter((raw: any) => {
      let loc = '';
      let title = '';
      if (candidate.provider === 'greenhouse') {
        loc = raw.location?.name || '';
        title = raw.title || '';
      } else if (candidate.provider === 'lever') {
        loc = raw.categories?.location || '';
        title = raw.text || '';
      } else if (candidate.provider === 'smartrecruiters') {
        const cCountry = (raw.location?.country || '').toLowerCase();
        if (cCountry === 'in') return true;
        loc = `${raw.location?.city || ''} ${raw.location?.region || ''} ${raw.location?.country || ''}`;
        title = raw.name || '';
      } else if (candidate.provider === 'ashby') {
        const secLocs = (raw.secondaryLocations || []).map((s: any) => s.location || '').join(' ');
        loc = `${raw.location || ''} ${secLocs}`;
        title = raw.title || '';
      }
      return /india|bengaluru|bangalore|gurgaon|gurugram|mumbai|pune|hyderabad|noida|delhi|chennai|kolkata|remote/i.test(
        loc + ' ' + title
      );
    });

    result.indiaJobs = indiaCandidates.length;
    result.isValid = result.totalJobs > 0;
    return result;
  } catch {
    return result;
  }
}

export async function discoverAndSeedAtsBoards() {
  const supabase = getSupabaseAdminClient();
  console.log(`[ATS Discovery] Probing ${CANDIDATE_REGISTRY.length} candidate boards across Greenhouse, Lever, SmartRecruiters, and Ashby...`);

  const poolSize = 12;
  const verifiedSources: any[] = [];

  for (let i = 0; i < CANDIDATE_REGISTRY.length; i += poolSize) {
    const batch = CANDIDATE_REGISTRY.slice(i, i + poolSize);
    const results = await Promise.all(batch.map(probeCandidate));

    for (const r of results) {
      if (r.isValid) {
        console.log(`  [MATCH] ${r.candidate.provider.toUpperCase()}: ${r.candidate.companyName} (${r.candidate.token}) -> ${r.totalJobs} total jobs, ${r.indiaJobs} India/remote`);
        verifiedSources.push({
          provider: r.candidate.provider,
          company_name: r.candidate.companyName,
          board_token: r.candidate.token,
          base_url: r.baseUrl,
          access_basis: 'public_api_terms_reviewed',
          crawl_interval: '6 hours',
          enabled: true,
        });
      }
    }
  }

  console.log(`\n[ATS Discovery] Discovered ${verifiedSources.length} verified responsive boards.`);

  console.log(`[ATS Discovery] Upserting into external_ats_sources in Supabase...`);
  const { data: upserted, error: upsertErr } = await supabase
    .from('external_ats_sources')
    .upsert(verifiedSources, { onConflict: 'provider,board_token' })
    .select('id, provider, company_name, board_token, enabled');

  if (upsertErr) {
    console.error('[ATS Discovery] Upsert Error:', upsertErr);
    throw upsertErr;
  }

  const { count: totalEnabled } = await supabase
    .from('external_ats_sources')
    .select('*', { count: 'exact', head: true })
    .eq('enabled', true);

  console.log(`[ATS Discovery Complete] Enabled boards in external_ats_sources: ${totalEnabled}`);
  return { verifiedSourcesCount: verifiedSources.length, totalEnabled };
}

if (process.argv[1] && process.argv[1].endsWith('discover-and-seed-ats.ts')) {
  discoverAndSeedAtsBoards()
    .then((res) => {
      console.log('Result:', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal error in discoverAndSeedAtsBoards:', err);
      process.exit(1);
    });
}
