const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    const k = line.slice(0, idx).trim();
    let v = line.slice(idx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
});

const supabase = createClient(env.TX_SUPABASE_URL, env.TALENTXCEL_SERVICE_ROLE_KEY);

const TARGET_MARKETS = [
  { code: 'IN', name: 'India', primaryCities: ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Noida', 'Gurgaon', 'Chennai'] },
  { code: 'US', name: 'United States', primaryCities: ['San Francisco', 'New York', 'Seattle', 'Austin', 'Boston', 'Chicago', 'Los Angeles'] },
  { code: 'GB', name: 'United Kingdom', primaryCities: ['London', 'Manchester', 'Edinburgh', 'Birmingham', 'Cambridge'] },
  { code: 'AE', name: 'UAE', primaryCities: ['Dubai', 'Abu Dhabi', 'Sharjah'] },
  { code: 'SG', name: 'Singapore', primaryCities: ['Singapore'] },
  { code: 'CA', name: 'Canada', primaryCities: ['Toronto', 'Vancouver', 'Montreal', 'Ottawa', 'Calgary'] },
  { code: 'DE', name: 'Germany', primaryCities: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne'] },
  { code: 'AU', name: 'Australia', primaryCities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'] },
  { code: 'NL', name: 'Netherlands', primaryCities: ['Amsterdam', 'Rotterdam', 'Utrecht', 'Eindhoven'] },
  { code: 'IE', name: 'Ireland', primaryCities: ['Dublin', 'Cork', 'Galway'] },
  { code: 'FR', name: 'France', primaryCities: ['Paris', 'Lyon', 'Toulouse'] },
  { code: 'SA', name: 'Saudi Arabia', primaryCities: ['Riyadh', 'Jeddah', 'Dammam'] },
  { code: 'JP', name: 'Japan', primaryCities: ['Tokyo', 'Osaka', 'Kyoto'] },
  { code: 'KR', name: 'South Korea', primaryCities: ['Seoul', 'Busan', 'Incheon'] }
];

async function evaluateGlobalMarkets() {
  console.log('=== EVALUATING GLOBAL PROFESSIONAL NETWORK MARKETS ===');

  // Fetch all active jobs
  const { data: jobs, error: jErr } = await supabase
    .from('jobs')
    .select('id, title, company_name, location, location_city, is_remote')
    .eq('is_active', true);

  // Fetch all consented public profiles
  const { data: profiles, error: pErr } = await supabase
    .from('public_profiles')
    .select('id, location, headline, skills');

  // Fetch all growth_geo_cities
  const { data: geoCities } = await supabase
    .from('growth_geo_cities')
    .select('slug, city_name, country_code, is_search_indexable, active_jobs_count, consented_professionals_count');

  const marketAnalysis = [];

  for (const market of TARGET_MARKETS) {
    const marketCities = new Set(market.primaryCities.map(c => c.toLowerCase()));
    const countryNameRegex = new RegExp('\\b' + market.name + '\\b', 'i');
    const countryCodeRegex = new RegExp('\\b' + market.code + '\\b', 'i');

    // Filter jobs matching market or its cities
    const matchedJobs = (jobs || []).filter(j => {
      const loc = (j.location || '').trim();
      const city = (j.location_city || '').trim().toLowerCase();
      if (countryNameRegex.test(loc) || countryCodeRegex.test(loc)) return true;
      if (marketCities.has(city)) return true;
      for (const mc of marketCities) {
        if (loc.toLowerCase().includes(mc)) return true;
      }
      return false;
    });

    // Filter profiles matching market or its cities
    const matchedProfiles = (profiles || []).filter(p => {
      const loc = (p.location || '').trim();
      if (countryNameRegex.test(loc) || countryCodeRegex.test(loc)) return true;
      for (const mc of marketCities) {
        if (loc.toLowerCase().includes(mc)) return true;
      }
      return false;
    });

    // Check existing geo cities in database
    const matchedGeoCities = (geoCities || []).filter(gc => {
      return gc.country_code === market.code || marketCities.has(gc.city_name.toLowerCase());
    });

    const indexableCities = matchedGeoCities.filter(gc => gc.is_search_indexable);

    // Readiness score calculation
    const jobWeight = matchedJobs.length * 2;
    const profileWeight = matchedProfiles.length * 5;
    const cityWeight = indexableCities.length * 10;
    const rawScore = Math.min(100, jobWeight + profileWeight + cityWeight);

    let readinessTier = 'INCUBATING_GATE';
    let recommendation = 'Maintain noindex thin-page protection until minimum 5 active jobs and 2 verified professionals exist.';

    if (rawScore >= 50 && matchedJobs.length >= 10) {
      readinessTier = 'ACTIVE_PRODUCTION_INDEXABLE';
      recommendation = 'Fully indexable market. Distribute high-priority job opportunities and city hubs.';
    } else if (rawScore >= 15 && (matchedJobs.length >= 3 || matchedProfiles.length >= 2)) {
      readinessTier = 'EMERGING_SOURCING_PIPELINE';
      recommendation = 'Targeted partner outreach, automated job scraping pipelines, and opt-in professional acquisition.';
    }

    marketAnalysis.push({
      countryCode: market.code,
      countryName: market.name,
      matchedActiveJobs: matchedJobs.length,
      matchedVerifiedProfiles: matchedProfiles.length,
      indexableCitiesCount: indexableCities.length,
      incubatingCitiesCount: matchedGeoCities.length - indexableCities.length,
      readinessScore: rawScore,
      readinessTier,
      recommendation,
      sampleJobs: matchedJobs.slice(0, 3).map(j => ({ id: j.id, title: j.title, location: j.location_city || j.location }))
    });
  }

  // Sort by readiness score descending
  marketAnalysis.sort((a, b) => b.readinessScore - a.readinessScore);

  const report = {
    evaluatedAt: new Date().toISOString(),
    totalMarketsEvaluated: TARGET_MARKETS.length,
    activeProductionMarkets: marketAnalysis.filter(m => m.readinessTier === 'ACTIVE_PRODUCTION_INDEXABLE').map(m => m.countryName),
    emergingMarkets: marketAnalysis.filter(m => m.readinessTier === 'EMERGING_SOURCING_PIPELINE').map(m => m.countryName),
    incubatingMarkets: marketAnalysis.filter(m => m.readinessTier === 'INCUBATING_GATE').map(m => m.countryName),
    marketDetails: marketAnalysis
  };

  fs.writeFileSync('reports/global_market_expansion_evaluation.json', JSON.stringify(report, null, 2));
  console.log('✅ Global Market Expansion Evaluation saved to reports/global_market_expansion_evaluation.json');
  console.log(`Active: ${report.activeProductionMarkets.join(', ')}`);
  console.log(`Emerging: ${report.emergingMarkets.join(', ')}`);
  console.log(`Incubating: ${report.incubatingMarkets.join(', ')}`);
}

evaluateGlobalMarkets().catch(err => {
  console.error('Error evaluating global markets:', err);
  process.exit(1);
});
