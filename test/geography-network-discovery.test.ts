// test/geography-network-discovery.test.ts
import { 
  resolveHierarchyFromParams, 
  resolveLocation, 
  buildCanonicalGeographicUrl,
  searchLocations,
  getCountryBySlug,
  getDivisionBySlug,
  getCityBySlug
} from '../src/lib/geography/resolver';
import { 
  GLOBAL_COUNTRIES, 
  GLOBAL_DIVISIONS, 
  GLOBAL_CITIES 
} from '../src/lib/geography/registry';
import { 
  evaluateIndexationEligibility, 
  SEO_INDEXATION_THRESHOLDS 
} from '../src/lib/network/discovery';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('================================================================');
console.log('🧪 RUNNING GLOBAL GEOGRAPHY & NETWORK DISCOVERY ENGINE TESTS');
console.log('================================================================\n');

// 1. Registry Invariants
console.log('--- 1. Testing Registry Invariants ---');
assert(GLOBAL_COUNTRIES.length >= 8, `Registry contains ${GLOBAL_COUNTRIES.length} countries (expected >= 8)`);
assert(GLOBAL_DIVISIONS.length >= 20, `Registry contains ${GLOBAL_DIVISIONS.length} divisions (expected >= 20)`);
assert(GLOBAL_CITIES.length >= 25, `Registry contains ${GLOBAL_CITIES.length} cities (expected >= 25)`);

// 2. Exact Path Resolution (Prompt Examples)
console.log('\n--- 2. Testing Exact URL Hierarchy Examples ---');
// /network/india
const indiaRes = resolveHierarchyFromParams('india');
assert(indiaRes.country?.id === 'IN', 'Resolves /network/india to country IN');
assert(indiaRes.division === null, '/network/india has null division');
assert(indiaRes.city === null, '/network/india has null city');
assert(buildCanonicalGeographicUrl(indiaRes.country!) === '/network/india', 'Canonical path is /network/india');

// /network/india/uttar-pradesh
const upRes = resolveHierarchyFromParams('india', 'uttar-pradesh');
assert(upRes.country?.id === 'IN', 'Resolves country IN');
assert(upRes.division?.slug === 'uttar-pradesh', 'Resolves division uttar-pradesh');
assert(upRes.city === null, 'Division level has null city');
assert(buildCanonicalGeographicUrl(upRes.country!, upRes.division) === '/network/india/uttar-pradesh', 'Canonical path is /network/india/uttar-pradesh');

// /network/india/uttar-pradesh/noida
const noidaRes = resolveHierarchyFromParams('india', 'uttar-pradesh', 'noida');
assert(noidaRes.country?.id === 'IN', 'Resolves country IN');
assert(noidaRes.division?.slug === 'uttar-pradesh', 'Resolves division uttar-pradesh');
assert(noidaRes.city?.slug === 'noida', 'Resolves city noida');
assert(buildCanonicalGeographicUrl(noidaRes.country!, noidaRes.division, noidaRes.city) === '/network/india/uttar-pradesh/noida', 'Canonical path is /network/india/uttar-pradesh/noida');

// /network/india/maharashtra/mumbai
const mumbaiRes = resolveHierarchyFromParams('india', 'maharashtra', 'mumbai');
assert(mumbaiRes.city?.slug === 'mumbai', 'Resolves city mumbai in maharashtra');
assert(buildCanonicalGeographicUrl(mumbaiRes.country!, mumbaiRes.division, mumbaiRes.city) === '/network/india/maharashtra/mumbai', 'Canonical path matches Mumbai');

// /network/united-states/california/san-francisco
const sfRes = resolveHierarchyFromParams('united-states', 'california', 'san-francisco');
assert(sfRes.country?.id === 'US', 'Resolves country US');
assert(sfRes.division?.slug === 'california', 'Resolves division california');
assert(sfRes.city?.slug === 'san-francisco', 'Resolves city san-francisco');
assert(buildCanonicalGeographicUrl(sfRes.country!, sfRes.division, sfRes.city) === '/network/united-states/california/san-francisco', 'Canonical path matches SF');

// /network/united-kingdom/london (2-level direct city hub)
const londonRes = resolveHierarchyFromParams('united-kingdom', 'london');
assert(londonRes.country?.id === 'GB', 'Resolves UK country');
assert(londonRes.city?.slug === 'london', 'Resolves city london');

// /network/canada/ontario/toronto
const torontoRes = resolveHierarchyFromParams('canada', 'ontario', 'toronto');
assert(torontoRes.country?.id === 'CA', 'Resolves Canada');
assert(torontoRes.division?.slug === 'ontario', 'Resolves Ontario');
assert(torontoRes.city?.slug === 'toronto', 'Resolves Toronto');

// 3. Searchable Aliases & Normalization
console.log('\n--- 3. Testing Searchable Aliases & Location Normalization ---');
const blrNorm = resolveLocation('Bengaluru, Karnataka, India');
assert(blrNorm?.city?.slug === 'bengaluru', 'Normalizes "Bengaluru, Karnataka, India" -> bengaluru');

const bangaloreAlias = resolveLocation('Bangalore');
assert(bangaloreAlias?.city?.slug === 'bengaluru', 'Alias "Bangalore" maps to canonical slug "bengaluru"');

const bombayAlias = resolveLocation('Bombay, India');
assert(bombayAlias?.city?.slug === 'mumbai', 'Alias "Bombay" maps to canonical slug "mumbai"');

const sfAlias = resolveLocation('Silicon Valley, CA');
assert(sfAlias?.city?.slug === 'san-francisco' || sfAlias?.city?.slug === 'san-jose', 'Alias "Silicon Valley" maps to SF Bay Area');

const noidaNorm = resolveLocation('Noida Sector 62, Uttar Pradesh');
assert(noidaNorm?.city?.slug === 'noida', 'Normalizes "Noida Sector 62, Uttar Pradesh" -> noida');

const gurgaonAlias = resolveLocation('Cyber City, Gurgaon');
assert(gurgaonAlias?.city?.slug === 'gurugram', 'Alias "Gurgaon" maps to canonical slug "gurugram"');

const remoteNorm = resolveLocation('Global Remote');
assert(remoteNorm?.level === 'city' && remoteNorm.country.id === 'GLOBAL', 'Normalizes "Global Remote" to GLOBAL');

// 4. Indexation Governance & Thresholds (Phase 11)
console.log('\n--- 4. Testing Indexation Governance & Thresholds ---');
const cityEligible = evaluateIndexationEligibility('city', 35, 1);
assert(cityEligible.isIndexable === true, 'City with 35 profiles is indexable');
assert(cityEligible.robots === 'index, follow', 'Eligible city has robots: index, follow');

const cityIneligible = evaluateIndexationEligibility('city', 12, 0);
assert(cityIneligible.isIndexable === false, 'City with 12 profiles is below threshold');
assert(cityIneligible.robots === 'noindex, follow', 'Ineligible city has robots: noindex, follow');

const countryEligible = evaluateIndexationEligibility('country', 350, 5);
assert(countryEligible.isIndexable === true, 'Country with 350 profiles is indexable');

const countryIneligible = evaluateIndexationEligibility('country', 150, 0);
assert(countryIneligible.isIndexable === false, 'Country with 150 profiles is below threshold');

// 5. Autocomplete & Multi-Search
console.log('\n--- 5. Testing Autocomplete & Search ---');
const searchNoida = searchLocations('noid', 5);
assert(searchNoida.length > 0 && searchNoida[0].city?.slug === 'noida', 'Search "noid" finds Noida');

const searchLon = searchLocations('lond', 5);
assert(searchLon.length > 0 && searchLon[0].city?.slug === 'london', 'Search "lond" finds London');

// 6. Intelligent Discovery Context Fallback Invariants
console.log('\n--- 6. Testing Intelligent Discovery Context Fallback Invariants ---');
const nullContextLocation = resolveLocation(null as any);
assert(nullContextLocation === null, 'Null user location resolves to null for global fallback');

const emptyContextLocation = resolveLocation('');
assert(emptyContextLocation === null, 'Empty user location resolves to null for global fallback');

const validUserLocation = resolveLocation('Bengaluru, Karnataka');
assert(validUserLocation?.city?.slug === 'bengaluru', 'User profile location correctly resolves to canonical city hub');

console.log('\n================================================================');
console.log('🎉 ALL GEOGRAPHY & NETWORK DISCOVERY ENGINE TESTS PASSED (100%)');
console.log('================================================================\n');
