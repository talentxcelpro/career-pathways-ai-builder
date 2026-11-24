const fs = require('fs');
const path = require('path');
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

// Load existing locations from src/config/jobs/locations.ts if available, or build robust base
let baseLocations = [];
try {
  const locFilePath = path.join(__dirname, '../../src/config/jobs/locations.ts');
  if (fs.existsSync(locFilePath)) {
    const content = fs.readFileSync(locFilePath, 'utf8');
    const match = content.match(/export const JOB_LOCATIONS: JobLocationConfig\[\] = (\[[\s\S]*?\]);/);
    if (match) {
      baseLocations = JSON.parse(match[1]);
      console.log(`Loaded ${baseLocations.length} locations from src/config/jobs/locations.ts`);
    }
  }
} catch (e) {
  console.warn('Could not parse locations.ts directly:', e.message);
}

// Global Core Expansion Hubs (Top International Hubs Across Continents)
const GLOBAL_EXPANSION_HUBS = [
  // North America
  { slug: 'new-york', cityName: 'New York', stateName: 'New York', countryName: 'United States', countryCode: 'US', continent: 'north-america', tier: 1, lat: 40.7128, lng: -74.0060, pop: 8336817 },
  { slug: 'san-francisco', cityName: 'San Francisco', stateName: 'California', countryName: 'United States', countryCode: 'US', continent: 'north-america', tier: 1, lat: 37.7749, lng: -122.4194, pop: 873965 },
  { slug: 'seattle', cityName: 'Seattle', stateName: 'Washington', countryName: 'United States', countryCode: 'US', continent: 'north-america', tier: 1, lat: 47.6062, lng: -122.3321, pop: 737015 },
  { slug: 'austin', cityName: 'Austin', stateName: 'Texas', countryName: 'United States', countryCode: 'US', continent: 'north-america', tier: 1, lat: 30.2672, lng: -97.7431, pop: 961855 },
  { slug: 'boston', cityName: 'Boston', stateName: 'Massachusetts', countryName: 'United States', countryCode: 'US', continent: 'north-america', tier: 1, lat: 42.3601, lng: -71.0589, pop: 675647 },
  { slug: 'chicago', cityName: 'Chicago', stateName: 'Illinois', countryName: 'United States', countryCode: 'US', continent: 'north-america', tier: 1, lat: 41.8781, lng: -87.6298, pop: 2746388 },
  { slug: 'los-angeles', cityName: 'Los Angeles', stateName: 'California', countryName: 'United States', countryCode: 'US', continent: 'north-america', tier: 1, lat: 34.0522, lng: -118.2437, pop: 3898747 },
  { slug: 'toronto', cityName: 'Toronto', stateName: 'Ontario', countryName: 'Canada', countryCode: 'CA', continent: 'north-america', tier: 1, lat: 43.6532, lng: -79.3832, pop: 2794356 },
  { slug: 'vancouver', cityName: 'Vancouver', stateName: 'British Columbia', countryName: 'Canada', countryCode: 'CA', continent: 'north-america', tier: 1, lat: 49.2827, lng: -123.1207, pop: 662248 },

  // Europe
  { slug: 'london', cityName: 'London', stateName: 'Greater London', countryName: 'United Kingdom', countryCode: 'GB', continent: 'europe', tier: 1, lat: 51.5074, lng: -0.1278, pop: 8982000 },
  { slug: 'birmingham-uk', cityName: 'Birmingham', stateName: 'West Midlands', countryName: 'United Kingdom', countryCode: 'GB', continent: 'europe', tier: 2, lat: 52.4862, lng: -1.8904, pop: 1149000 },
  { slug: 'manchester', cityName: 'Manchester', stateName: 'Greater Manchester', countryName: 'United Kingdom', countryCode: 'GB', continent: 'europe', tier: 2, lat: 53.4808, lng: -2.2426, pop: 553230 },
  { slug: 'berlin', cityName: 'Berlin', stateName: 'Berlin', countryName: 'Germany', countryCode: 'DE', continent: 'europe', tier: 1, lat: 52.5200, lng: 13.4050, pop: 3645000 },
  { slug: 'munich', cityName: 'Munich', stateName: 'Bavaria', countryName: 'Germany', countryCode: 'DE', continent: 'europe', tier: 1, lat: 48.1351, lng: 11.5820, pop: 1472000 },
  { slug: 'frankfurt', cityName: 'Frankfurt', stateName: 'Hesse', countryName: 'Germany', countryCode: 'DE', continent: 'europe', tier: 2, lat: 50.1109, lng: 8.6821, pop: 753056 },
  { slug: 'amsterdam', cityName: 'Amsterdam', stateName: 'North Holland', countryName: 'Netherlands', countryCode: 'NL', continent: 'europe', tier: 1, lat: 52.3676, lng: 4.9041, pop: 872680 },
  { slug: 'dublin', cityName: 'Dublin', stateName: 'Leinster', countryName: 'Ireland', countryCode: 'IE', continent: 'europe', tier: 1, lat: 53.3498, lng: -6.2603, pop: 544107 },
  { slug: 'paris', cityName: 'Paris', stateName: 'Ile-de-France', countryName: 'France', countryCode: 'FR', continent: 'europe', tier: 1, lat: 48.8566, lng: 2.3522, pop: 2161000 },
  { slug: 'zurich', cityName: 'Zurich', stateName: 'Zurich', countryName: 'Switzerland', countryCode: 'CH', continent: 'europe', tier: 1, lat: 47.3769, lng: 8.5417, pop: 402762 },

  // Middle East
  { slug: 'dubai', cityName: 'Dubai', stateName: 'Dubai', countryName: 'United Arab Emirates', countryCode: 'AE', continent: 'middle-east', tier: 1, lat: 25.2048, lng: 55.2708, pop: 3331420 },
  { slug: 'abu-dhabi', cityName: 'Abu Dhabi', stateName: 'Abu Dhabi', countryName: 'United Arab Emirates', countryCode: 'AE', continent: 'middle-east', tier: 1, lat: 24.4539, lng: 54.3773, pop: 1450000 },
  { slug: 'riyadh', cityName: 'Riyadh', stateName: 'Riyadh Region', countryName: 'Saudi Arabia', countryCode: 'SA', continent: 'middle-east', tier: 1, lat: 24.7136, lng: 46.6753, pop: 7676654 },
  { slug: 'doha', cityName: 'Doha', stateName: 'Doha', countryName: 'Qatar', countryCode: 'QA', continent: 'middle-east', tier: 2, lat: 25.2854, lng: 51.5310, pop: 956460 },

  // Asia-Pacific
  { slug: 'singapore', cityName: 'Singapore', stateName: 'Singapore', countryName: 'Singapore', countryCode: 'SG', continent: 'asia', tier: 1, lat: 1.3521, lng: 103.8198, pop: 5685800 },
  { slug: 'sydney', cityName: 'Sydney', stateName: 'New South Wales', countryName: 'Australia', countryCode: 'AU', continent: 'oceania', tier: 1, lat: -33.8688, lng: 151.2093, pop: 5312000 },
  { slug: 'melbourne', cityName: 'Melbourne', stateName: 'Victoria', countryName: 'Australia', countryCode: 'AU', continent: 'oceania', tier: 1, lat: -37.8136, lng: 144.9631, pop: 5078000 },
  { slug: 'tokyo', cityName: 'Tokyo', stateName: 'Tokyo', countryName: 'Japan', countryCode: 'JP', continent: 'asia', tier: 1, lat: 35.6762, lng: 139.6503, pop: 13960000 },
  { slug: 'kuala-lumpur', cityName: 'Kuala Lumpur', stateName: 'Federal Territory', countryName: 'Malaysia', countryCode: 'MY', continent: 'asia', tier: 2, lat: 3.1390, lng: 101.6869, pop: 1808000 }
];

function normalizeLocationString(str) {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/[,\-\(\)\/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function runGeographyEngine() {
  console.log('=== RUNNING GLOBAL PROFESSIONAL GEOGRAPHY ENGINE ===');

  // 1. Fetch real active jobs
  const { data: dbJobs, error: jobErr } = await supabase
    .from('jobs')
    .select('id, location, location_city, is_active, job_status')
    .eq('is_active', true);

  // 2. Fetch real consented profiles
  const { data: dbProfiles, error: profErr } = await supabase
    .from('public_profiles')
    .select('id, location, headline, skills, industry');

  // 3. Fetch real public posts
  const { data: dbPosts, error: postErr } = await supabase
    .from('posts')
    .select('id, location, content, is_public')
    .eq('is_public', true);

  console.log(`Real DB inventory loaded: ${dbJobs?.length || 0} active jobs, ${dbProfiles?.length || 0} consented public profiles, ${dbPosts?.length || 0} public posts.`);

  // Combine base locations + global expansion
  const cityRegistry = new Map();

  for (const b of baseLocations) {
    cityRegistry.set(b.slug, {
      slug: b.slug,
      cityName: b.cityName,
      stateName: b.stateName || '',
      countryName: b.countryName || 'India',
      countryCode: b.countryCode || 'IN',
      continent: b.continent || 'asia',
      tier: b.tier || 3,
      latitude: b.latitude || null,
      longitude: b.longitude || null,
      populationProxy: b.tier === 1 ? 5000000 : (b.tier === 2 ? 1500000 : 400000),
      aliases: (b.aliases || []).map(a => a.toLowerCase())
    });
  }

  for (const g of GLOBAL_EXPANSION_HUBS) {
    if (!cityRegistry.has(g.slug)) {
      cityRegistry.set(g.slug, {
        slug: g.slug,
        cityName: g.cityName,
        stateName: g.stateName,
        countryName: g.countryName,
        countryCode: g.countryCode,
        continent: g.continent,
        tier: g.tier,
        latitude: g.lat,
        longitude: g.lng,
        populationProxy: g.pop,
        aliases: [g.cityName.toLowerCase(), g.slug]
      });
    }
  }

  // Count Real Inventory Per City
  const jobCounts = {};
  const proCounts = {};
  const postCounts = {};

  const matchCitySlug = (rawLocation) => {
    if (!rawLocation) return null;
    const norm = normalizeLocationString(rawLocation);
    for (const [slug, entry] of cityRegistry.entries()) {
      if (norm.includes(entry.cityName.toLowerCase()) || norm.includes(slug)) {
        return slug;
      }
      for (const al of entry.aliases) {
        if (norm.includes(al)) return slug;
      }
    }
    return null;
  };

  (dbJobs || []).forEach(j => {
    const loc = j.location_city || j.location;
    const slug = matchCitySlug(loc);
    if (slug) {
      jobCounts[slug] = (jobCounts[slug] || 0) + 1;
    }
  });

  (dbProfiles || []).forEach(p => {
    const slug = matchCitySlug(p.location);
    if (slug) {
      proCounts[slug] = (proCounts[slug] || 0) + 1;
    }
  });

  (dbPosts || []).forEach(po => {
    const slug = matchCitySlug(po.location);
    if (slug) {
      postCounts[slug] = (postCounts[slug] || 0) + 1;
    }
  });

  // Calculate Scores & Gates
  const recordsToUpsert = [];
  let indexableCount = 0;
  let emergingCount = 0;
  let incubatingCount = 0;

  for (const [slug, c] of cityRegistry.entries()) {
    const activeJobs = jobCounts[slug] || 0;
    const consentedPros = proCounts[slug] || 0;
    const discussions = postCounts[slug] || 0;

    // Job inventory score (0-25)
    const jobScore = Math.min(25, (activeJobs / 10) * 25);
    // Professional inventory score (0-25)
    const proScore = Math.min(25, (consentedPros / 5) * 25);
    // Content / Discussion score (0-15)
    const contentScore = Math.min(15, (discussions / 3) * 15);
    // Population proxy weight (0-15)
    const popScore = Math.min(15, (c.populationProxy / 5000000) * 15);
    // Tier baseline (0-20): Tier 1 = 20, Tier 2 = 12, Tier 3 = 6, Tier 4 = 2
    const tierScores = { 1: 20, 2: 12, 3: 6, 4: 2 };
    const tierScore = tierScores[c.tier] || 2;

    const priorityScore = parseFloat((jobScore + proScore + contentScore + popScore + tierScore).toFixed(2));

    // Strict Quality Gate:
    // INDEXABLE: activeJobs >= 5 OR (consentedPros >= 2 AND discussions >= 1)
    // EMERGING: activeJobs >= 1 OR consentedPros >= 1
    // INCUBATING: 0 inventory
    let gate = 'incubating';
    if (activeJobs >= 5 || (consentedPros >= 2 && discussions >= 1)) {
      gate = 'indexable';
      indexableCount++;
    } else if (activeJobs >= 1 || consentedPros >= 1) {
      gate = 'emerging';
      emergingCount++;
    } else {
      gate = 'incubating';
      incubatingCount++;
    }

    recordsToUpsert.push({
      slug: c.slug,
      city_name: c.cityName,
      state_name: c.stateName || null,
      country_name: c.countryName,
      country_code: c.countryCode,
      continent: c.continent,
      tier: c.tier,
      population_proxy: c.populationProxy,
      latitude: c.latitude,
      longitude: c.longitude,
      active_jobs_count: activeJobs,
      consented_professionals_count: consentedPros,
      discussions_count: discussions,
      communities_count: 0,
      demand_search_index: parseFloat(popScore.toFixed(2)),
      registration_conversion_rate: 0.0000,
      priority_score: priorityScore,
      indexation_gate: gate,
      quality_assessment: {
        activeJobs,
        consentedPros,
        discussions,
        tier: c.tier,
        robotsDirective: gate === 'indexable' ? 'index, follow' : 'noindex, follow',
        hasSufficientInventory: gate === 'indexable',
        isThinPageRisk: activeJobs === 0 && consentedPros === 0
      },
      last_evaluated_at: new Date().toISOString()
    });
  }

  console.log(`Total cities evaluated: ${recordsToUpsert.length}`);
  console.log(`Gate Breakdown: Indexable = ${indexableCount}, Emerging = ${emergingCount}, Incubating = ${incubatingCount}`);

  // Batch Upsert into Supabase (500 at a time)
  const batchSize = 250;
  for (let i = 0; i < recordsToUpsert.length; i += batchSize) {
    const chunk = recordsToUpsert.slice(i, i + batchSize);
    const { error: upsertErr } = await supabase
      .from('growth_geo_cities')
      .upsert(chunk, { onConflict: 'slug' });

    if (upsertErr) {
      console.error(`Error upserting chunk ${i / batchSize}:`, upsertErr.message);
    } else {
      console.log(`✓ Upserted chunk ${i} - ${i + chunk.length}`);
    }
  }

  // Save report
  const summary = {
    totalCitiesEvaluated: recordsToUpsert.length,
    indexableCitiesCount: indexableCount,
    emergingCitiesCount: emergingCount,
    incubatingCitiesCount: incubatingCount,
    topPriorityCities: recordsToUpsert.sort((a, b) => b.priority_score - a.priority_score).slice(0, 25).map(c => ({
      slug: c.slug,
      cityName: c.city_name,
      country: c.country_name,
      activeJobs: c.active_jobs_count,
      consentedPros: c.consented_professionals_count,
      priorityScore: c.priority_score,
      gate: c.indexation_gate
    }))
  };

  fs.writeFileSync('reports/global_geography_engine_report.json', JSON.stringify(summary, null, 2), 'utf8');
  console.log('✅ Global geography evaluation completed and saved to reports/global_geography_engine_report.json');
}

runGeographyEngine().catch(console.error);
