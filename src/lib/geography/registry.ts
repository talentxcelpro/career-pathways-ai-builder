// src/lib/geography/registry.ts
import { GeographicCountry, GeographicDivision, GeographicCity } from './types';

/**
 * Authoritative Global Geography Registry
 * Standardized ISO codes, unique slugs, country-specific administrative divisions,
 * cities, metropolitan areas, and searchable aliases.
 */

export const GLOBAL_COUNTRIES: GeographicCountry[] = [
  {
    id: 'IN',
    name: 'India',
    slug: 'india',
    demonym: 'Indian',
    continent: 'Asia',
    flag: '🇮🇳',
    adminDivisionType: 'state',
  },
  {
    id: 'US',
    name: 'United States',
    slug: 'united-states',
    demonym: 'American',
    continent: 'North America',
    flag: '🇺🇸',
    adminDivisionType: 'state',
  },
  {
    id: 'GB',
    name: 'United Kingdom',
    slug: 'united-kingdom',
    demonym: 'British',
    continent: 'Europe',
    flag: '🇬🇧',
    adminDivisionType: 'region',
    isDirectCityState: false,
  },
  {
    id: 'AE',
    name: 'United Arab Emirates',
    slug: 'united-arab-emirates',
    demonym: 'Emirati',
    continent: 'Asia',
    flag: '🇦🇪',
    adminDivisionType: 'emirate',
  },
  {
    id: 'CA',
    name: 'Canada',
    slug: 'canada',
    demonym: 'Canadian',
    continent: 'North America',
    flag: '🇨🇦',
    adminDivisionType: 'province',
  },
  {
    id: 'SG',
    name: 'Singapore',
    slug: 'singapore',
    demonym: 'Singaporean',
    continent: 'Asia',
    flag: '🇸🇬',
    adminDivisionType: 'city-state',
    isDirectCityState: true,
  },
  {
    id: 'DE',
    name: 'Germany',
    slug: 'germany',
    demonym: 'German',
    continent: 'Europe',
    flag: '🇩🇪',
    adminDivisionType: 'state',
  },
  {
    id: 'AU',
    name: 'Australia',
    slug: 'australia',
    demonym: 'Australian',
    continent: 'Oceania',
    flag: '🇦🇺',
    adminDivisionType: 'state',
  },
  {
    id: 'GLOBAL',
    name: 'Global Remote',
    slug: 'global-remote',
    demonym: 'Global',
    continent: 'Worldwide',
    flag: '🌐',
    adminDivisionType: 'unitary',
    isDirectCityState: true,
  }
];

export const GLOBAL_DIVISIONS: GeographicDivision[] = [
  // --- INDIA STATES & UNION TERRITORIES ---
  { id: 'IN-UP', countryId: 'IN', name: 'Uttar Pradesh', slug: 'uttar-pradesh', code: 'UP', type: 'state', aliases: ['up', 'u.p.'] },
  { id: 'IN-KA', countryId: 'IN', name: 'Karnataka', slug: 'karnataka', code: 'KA', type: 'state', aliases: ['ka'] },
  { id: 'IN-MH', countryId: 'IN', name: 'Maharashtra', slug: 'maharashtra', code: 'MH', type: 'state', aliases: ['mh'] },
  { id: 'IN-DL', countryId: 'IN', name: 'Delhi', slug: 'delhi', code: 'DL', type: 'territory', aliases: ['delhi-ncr', 'nct of delhi', 'new delhi'] },
  { id: 'IN-HR', countryId: 'IN', name: 'Haryana', slug: 'haryana', code: 'HR', type: 'state', aliases: ['hr'] },
  { id: 'IN-TG', countryId: 'IN', name: 'Telangana', slug: 'telangana', code: 'TG', type: 'state', aliases: ['ts', 'tg'] },
  { id: 'IN-TN', countryId: 'IN', name: 'Tamil Nadu', slug: 'tamil-nadu', code: 'TN', type: 'state', aliases: ['tn'] },
  { id: 'IN-WB', countryId: 'IN', name: 'West Bengal', slug: 'west-bengal', code: 'WB', type: 'state', aliases: ['wb', 'bengal'] },
  { id: 'IN-GJ', countryId: 'IN', name: 'Gujarat', slug: 'gujarat', code: 'GJ', type: 'state', aliases: ['gj'] },
  { id: 'IN-KL', countryId: 'IN', name: 'Kerala', slug: 'kerala', code: 'KL', type: 'state', aliases: ['kl'] },
  { id: 'IN-MP', countryId: 'IN', name: 'Madhya Pradesh', slug: 'madhya-pradesh', code: 'MP', type: 'state', aliases: ['mp'] },
  { id: 'IN-RJ', countryId: 'IN', name: 'Rajasthan', slug: 'rajasthan', code: 'RJ', type: 'state', aliases: ['rj'] },
  { id: 'IN-PB', countryId: 'IN', name: 'Punjab', slug: 'punjab', code: 'PB', type: 'state', aliases: ['pb'] },
  { id: 'IN-BR', countryId: 'IN', name: 'Bihar', slug: 'bihar', code: 'BR', type: 'state', aliases: ['br'] },
  { id: 'IN-OR', countryId: 'IN', name: 'Odisha', slug: 'odisha', code: 'OR', type: 'state', aliases: ['orissa'] },
  { id: 'IN-AP', countryId: 'IN', name: 'Andhra Pradesh', slug: 'andhra-pradesh', code: 'AP', type: 'state', aliases: ['ap'] },

  // --- UNITED STATES STATES ---
  { id: 'US-CA', countryId: 'US', name: 'California', slug: 'california', code: 'CA', type: 'state', aliases: ['calif', 'ca'] },
  { id: 'US-NY', countryId: 'US', name: 'New York', slug: 'new-york', code: 'NY', type: 'state', aliases: ['ny'] },
  { id: 'US-WA', countryId: 'US', name: 'Washington', slug: 'washington', code: 'WA', type: 'state', aliases: ['wa'] },
  { id: 'US-TX', countryId: 'US', name: 'Texas', slug: 'texas', code: 'TX', type: 'state', aliases: ['tx'] },
  { id: 'US-MA', countryId: 'US', name: 'Massachusetts', slug: 'massachusetts', code: 'MA', type: 'state', aliases: ['mass', 'ma'] },
  { id: 'US-IL', countryId: 'US', name: 'Illinois', slug: 'illinois', code: 'IL', type: 'state', aliases: ['il'] },
  { id: 'US-CO', countryId: 'US', name: 'Colorado', slug: 'colorado', code: 'CO', type: 'state', aliases: ['co'] },
  { id: 'US-GA', countryId: 'US', name: 'Georgia', slug: 'georgia', code: 'GA', type: 'state', aliases: ['ga'] },
  { id: 'US-NC', countryId: 'US', name: 'North Carolina', slug: 'north-carolina', code: 'NC', type: 'state', aliases: ['nc'] },
  { id: 'US-FL', countryId: 'US', name: 'Florida', slug: 'florida', code: 'FL', type: 'state', aliases: ['fl'] },

  // --- UNITED KINGDOM REGIONS ---
  { id: 'GB-ENG', countryId: 'GB', name: 'England', slug: 'england', code: 'ENG', type: 'region', aliases: ['greater-london', 'uk-england'] },
  { id: 'GB-SCT', countryId: 'GB', name: 'Scotland', slug: 'scotland', code: 'SCT', type: 'region', aliases: ['uk-scotland'] },

  // --- UNITED ARAB EMIRATES EMIRATES ---
  { id: 'AE-DU', countryId: 'AE', name: 'Dubai', slug: 'dubai', code: 'DXB', type: 'emirate', aliases: ['emirate of dubai'] },
  { id: 'AE-AZ', countryId: 'AE', name: 'Abu Dhabi', slug: 'abu-dhabi', code: 'AUH', type: 'emirate', aliases: ['emirate of abu dhabi'] },
  { id: 'AE-SH', countryId: 'AE', name: 'Sharjah', slug: 'sharjah', code: 'SHJ', type: 'emirate', aliases: ['emirate of sharjah'] },

  // --- CANADA PROVINCES ---
  { id: 'CA-ON', countryId: 'CA', name: 'Ontario', slug: 'ontario', code: 'ON', type: 'province', aliases: ['on'] },
  { id: 'CA-BC', countryId: 'CA', name: 'British Columbia', slug: 'british-columbia', code: 'BC', type: 'province', aliases: ['bc'] },
  { id: 'CA-QC', countryId: 'CA', name: 'Quebec', slug: 'quebec', code: 'QC', type: 'province', aliases: ['qc'] },
  { id: 'CA-AB', countryId: 'CA', name: 'Alberta', slug: 'alberta', code: 'AB', type: 'province', aliases: ['ab'] },

  // --- GERMANY STATES ---
  { id: 'DE-BE', countryId: 'DE', name: 'Berlin', slug: 'berlin', code: 'BE', type: 'state', aliases: ['berlin state'] },
  { id: 'DE-BY', countryId: 'DE', name: 'Bavaria', slug: 'bavaria', code: 'BY', type: 'state', aliases: ['bayern'] },
  { id: 'DE-HE', countryId: 'DE', name: 'Hesse', slug: 'hesse', code: 'HE', type: 'state', aliases: ['hessen'] },

  // --- AUSTRALIA STATES ---
  { id: 'AU-NSW', countryId: 'AU', name: 'New South Wales', slug: 'new-south-wales', code: 'NSW', type: 'state', aliases: ['nsw'] },
  { id: 'AU-VIC', countryId: 'AU', name: 'Victoria', slug: 'victoria', code: 'VIC', type: 'state', aliases: ['vic'] }
];

export const GLOBAL_CITIES: GeographicCity[] = [
  // --- INDIA CITIES ---
  {
    id: 'in-up-noida',
    countryId: 'IN',
    divisionId: 'IN-UP',
    name: 'Noida',
    slug: 'noida',
    metroArea: 'Delhi NCR',
    aliases: ['new okhla industrial development authority', 'noida sector'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 28.5355, lng: 77.3910 }
  },
  {
    id: 'in-up-greater-noida',
    countryId: 'IN',
    divisionId: 'IN-UP',
    name: 'Greater Noida',
    slug: 'greater-noida',
    metroArea: 'Delhi NCR',
    aliases: ['gr noida', 'greater noida west'],
    tier: 2,
    isTechHub: true,
    approxCoordinates: { lat: 28.4744, lng: 77.5040 }
  },
  {
    id: 'in-up-lucknow',
    countryId: 'IN',
    divisionId: 'IN-UP',
    name: 'Lucknow',
    slug: 'lucknow',
    aliases: ['lko'],
    tier: 2,
    isTechHub: true,
    approxCoordinates: { lat: 26.8467, lng: 80.9462 }
  },
  {
    id: 'in-ka-bengaluru',
    countryId: 'IN',
    divisionId: 'IN-KA',
    name: 'Bengaluru',
    slug: 'bengaluru',
    metroArea: 'Bangalore Metropolitan Region',
    aliases: ['bangalore', 'bengalooru', 'blr', 'silicon valley of india', 'whitefield', 'electronic city'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 12.9716, lng: 77.5946 }
  },
  {
    id: 'in-ka-mysuru',
    countryId: 'IN',
    divisionId: 'IN-KA',
    name: 'Mysuru',
    slug: 'mysuru',
    aliases: ['mysore'],
    tier: 2,
    isTechHub: true,
    approxCoordinates: { lat: 12.2958, lng: 76.6394 }
  },
  {
    id: 'in-mh-mumbai',
    countryId: 'IN',
    divisionId: 'IN-MH',
    name: 'Mumbai',
    slug: 'mumbai',
    metroArea: 'Mumbai Metropolitan Region',
    aliases: ['bombay', 'bkc', 'navi mumbai', 'thane', 'andheri'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 19.0760, lng: 72.8777 }
  },
  {
    id: 'in-mh-pune',
    countryId: 'IN',
    divisionId: 'IN-MH',
    name: 'Pune',
    slug: 'pune',
    metroArea: 'Pune Metropolitan Region',
    aliases: ['poona', 'hinjewadi'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 18.5204, lng: 73.8567 }
  },
  {
    id: 'in-dl-delhi',
    countryId: 'IN',
    divisionId: 'IN-DL',
    name: 'New Delhi',
    slug: 'delhi',
    metroArea: 'Delhi NCR',
    aliases: ['delhi', 'new delhi', 'nct', 'central delhi', 'south delhi'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 28.6139, lng: 77.2090 }
  },
  {
    id: 'in-hr-gurugram',
    countryId: 'IN',
    divisionId: 'IN-HR',
    name: 'Gurugram',
    slug: 'gurugram',
    metroArea: 'Delhi NCR',
    aliases: ['gurgaon', 'cyber city', 'dlf cyber city'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 28.4595, lng: 77.0266 }
  },
  {
    id: 'in-tg-hyderabad',
    countryId: 'IN',
    divisionId: 'IN-TG',
    name: 'Hyderabad',
    slug: 'hyderabad',
    metroArea: 'Hyderabad Metropolitan Region',
    aliases: ['hitech city', 'secunderabad', 'cyberabad'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 17.3850, lng: 78.4867 }
  },
  {
    id: 'in-tn-chennai',
    countryId: 'IN',
    divisionId: 'IN-TN',
    name: 'Chennai',
    slug: 'chennai',
    metroArea: 'Chennai Metropolitan Area',
    aliases: ['madras', 'omr', 'tidel park'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 13.0827, lng: 80.2707 }
  },
  {
    id: 'in-tn-coimbatore',
    countryId: 'IN',
    divisionId: 'IN-TN',
    name: 'Coimbatore',
    slug: 'coimbatore',
    aliases: ['kovai'],
    tier: 2,
    isTechHub: true,
    approxCoordinates: { lat: 11.0168, lng: 76.9558 }
  },
  {
    id: 'in-wb-kolkata',
    countryId: 'IN',
    divisionId: 'IN-WB',
    name: 'Kolkata',
    slug: 'kolkata',
    metroArea: 'Kolkata Metropolitan Area',
    aliases: ['calcutta', 'salt lake', 'new town'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 22.5726, lng: 88.3639 }
  },
  {
    id: 'in-gj-ahmedabad',
    countryId: 'IN',
    divisionId: 'IN-GJ',
    name: 'Ahmedabad',
    slug: 'ahmedabad',
    aliases: ['amdavad', 'gift city', 'gandhinagar'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 23.0225, lng: 72.5714 }
  },
  {
    id: 'in-kl-kochi',
    countryId: 'IN',
    divisionId: 'IN-KL',
    name: 'Kochi',
    slug: 'kochi',
    aliases: ['cochin', 'infopark'],
    tier: 2,
    isTechHub: true,
    approxCoordinates: { lat: 9.9312, lng: 76.2673 }
  },
  {
    id: 'in-mp-indore',
    countryId: 'IN',
    divisionId: 'IN-MP',
    name: 'Indore',
    slug: 'indore',
    aliases: ['super corridor'],
    tier: 2,
    isTechHub: true,
    approxCoordinates: { lat: 22.7196, lng: 75.8577 }
  },
  {
    id: 'in-rj-jaipur',
    countryId: 'IN',
    divisionId: 'IN-RJ',
    name: 'Jaipur',
    slug: 'jaipur',
    aliases: ['pink city'],
    tier: 2,
    isTechHub: true,
    approxCoordinates: { lat: 26.9124, lng: 75.7873 }
  },
  {
    id: 'in-pb-chandigarh',
    countryId: 'IN',
    divisionId: 'IN-PB',
    name: 'Chandigarh',
    slug: 'chandigarh',
    metroArea: 'Chandigarh Tricity',
    aliases: ['mohali', 'panchkula', 'tricity'],
    tier: 2,
    isTechHub: true,
    approxCoordinates: { lat: 30.7333, lng: 76.7794 }
  },

  // --- UNITED STATES CITIES ---
  {
    id: 'us-ca-san-francisco',
    countryId: 'US',
    divisionId: 'US-CA',
    name: 'San Francisco',
    slug: 'san-francisco',
    metroArea: 'San Francisco Bay Area',
    aliases: ['sf', 'bay area', 'silicon valley', 'san francisco bay area'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 37.7749, lng: -122.4194 }
  },
  {
    id: 'us-ca-san-jose',
    countryId: 'US',
    divisionId: 'US-CA',
    name: 'San Jose',
    slug: 'san-jose',
    metroArea: 'Silicon Valley',
    aliases: ['silicon valley', 'south bay'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 37.3382, lng: -121.8863 }
  },
  {
    id: 'us-ca-los-angeles',
    countryId: 'US',
    divisionId: 'US-CA',
    name: 'Los Angeles',
    slug: 'los-angeles',
    metroArea: 'Greater Los Angeles',
    aliases: ['la', 'silicon beach', 'santa monica'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 34.0522, lng: -118.2437 }
  },
  {
    id: 'us-ny-new-york',
    countryId: 'US',
    divisionId: 'US-NY',
    name: 'New York',
    slug: 'new-york',
    metroArea: 'New York Metropolitan Area',
    aliases: ['nyc', 'new york city', 'manhattan', 'brooklyn', 'silicon alley'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: 'us-wa-seattle',
    countryId: 'US',
    divisionId: 'US-WA',
    name: 'Seattle',
    slug: 'seattle',
    metroArea: 'Puget Sound Tech Corridor',
    aliases: ['bellevue', 'redmond'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 47.6062, lng: -122.3321 }
  },
  {
    id: 'us-tx-austin',
    countryId: 'US',
    divisionId: 'US-TX',
    name: 'Austin',
    slug: 'austin',
    metroArea: 'Austin-Round Rock',
    aliases: ['silicon hills'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 30.2672, lng: -97.7431 }
  },
  {
    id: 'us-tx-dallas',
    countryId: 'US',
    divisionId: 'US-TX',
    name: 'Dallas',
    slug: 'dallas',
    metroArea: 'Dallas-Fort Worth',
    aliases: ['dfw', 'dallas fort worth'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 32.7767, lng: -96.7970 }
  },
  {
    id: 'us-ma-boston',
    countryId: 'US',
    divisionId: 'US-MA',
    name: 'Boston',
    slug: 'boston',
    metroArea: 'Greater Boston',
    aliases: ['cambridge', 'route 128'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 42.3601, lng: -71.0589 }
  },

  // --- UNITED KINGDOM CITIES ---
  {
    id: 'gb-eng-london',
    countryId: 'GB',
    divisionId: 'GB-ENG',
    name: 'London',
    slug: 'london',
    metroArea: 'Greater London',
    aliases: ['silicon roundabout', 'shoreditch', 'canary wharf', 'city of london'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 51.5074, lng: -0.1278 }
  },
  {
    id: 'gb-eng-manchester',
    countryId: 'GB',
    divisionId: 'GB-ENG',
    name: 'Manchester',
    slug: 'manchester',
    aliases: ['greater manchester', 'media city'],
    tier: 2,
    isTechHub: true,
    approxCoordinates: { lat: 53.4808, lng: -2.2426 }
  },
  {
    id: 'gb-eng-cambridge',
    countryId: 'GB',
    divisionId: 'GB-ENG',
    name: 'Cambridge',
    slug: 'cambridge',
    aliases: ['silicon fen'],
    tier: 2,
    isTechHub: true,
    approxCoordinates: { lat: 52.2053, lng: 0.1218 }
  },

  // --- UNITED ARAB EMIRATES CITIES ---
  {
    id: 'ae-du-dubai',
    countryId: 'AE',
    divisionId: 'AE-DU',
    name: 'Dubai',
    slug: 'dubai',
    metroArea: 'Dubai Internet City & DIFC',
    aliases: ['dubai internet city', 'difc', 'dubai silicon oasis', 'dxb'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 25.2048, lng: 55.2708 }
  },
  {
    id: 'ae-az-abu-dhabi',
    countryId: 'AE',
    divisionId: 'AE-AZ',
    name: 'Abu Dhabi',
    slug: 'abu-dhabi',
    aliases: ['hub71', 'adgm'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 24.4539, lng: 54.3773 }
  },

  // --- CANADA CITIES ---
  {
    id: 'ca-on-toronto',
    countryId: 'CA',
    divisionId: 'CA-ON',
    name: 'Toronto',
    slug: 'toronto',
    metroArea: 'Greater Toronto Area',
    aliases: ['gta', 'silicon valley north', 'mississauga'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 43.6532, lng: -79.3832 }
  },
  {
    id: 'ca-bc-vancouver',
    countryId: 'CA',
    divisionId: 'CA-BC',
    name: 'Vancouver',
    slug: 'vancouver',
    metroArea: 'Metro Vancouver',
    aliases: ['cascadia tech corridor'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 49.2827, lng: -123.1207 }
  },
  {
    id: 'ca-on-waterloo',
    countryId: 'CA',
    divisionId: 'CA-ON',
    name: 'Waterloo',
    slug: 'waterloo',
    aliases: ['kitchener-waterloo', 'kw'],
    tier: 2,
    isTechHub: true,
    approxCoordinates: { lat: 43.4643, lng: -80.5204 }
  },

  // --- SINGAPORE ---
  {
    id: 'sg-singapore',
    countryId: 'SG',
    name: 'Singapore',
    slug: 'singapore',
    metroArea: 'Singapore Central Business District',
    aliases: ['lion city', 'sg', 'one-north'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 1.3521, lng: 103.8198 }
  },

  // --- GERMANY CITIES ---
  {
    id: 'de-be-berlin',
    countryId: 'DE',
    divisionId: 'DE-BE',
    name: 'Berlin',
    slug: 'berlin',
    aliases: ['silicon allee'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 52.5200, lng: 13.4050 }
  },
  {
    id: 'de-by-munich',
    countryId: 'DE',
    divisionId: 'DE-BY',
    name: 'Munich',
    slug: 'munich',
    aliases: ['münchen', 'isar valley'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: 48.1351, lng: 11.5820 }
  },

  // --- AUSTRALIA CITIES ---
  {
    id: 'au-nsw-sydney',
    countryId: 'AU',
    divisionId: 'AU-NSW',
    name: 'Sydney',
    slug: 'sydney',
    aliases: ['tech central sydney'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: -33.8688, lng: 151.2093 }
  },
  {
    id: 'au-vic-melbourne',
    countryId: 'AU',
    divisionId: 'AU-VIC',
    name: 'Melbourne',
    slug: 'melbourne',
    aliases: ['docklands'],
    tier: 1,
    isTechHub: true,
    approxCoordinates: { lat: -37.8136, lng: 144.9631 }
  },

  // --- GLOBAL REMOTE ---
  {
    id: 'global-remote-worldwide',
    countryId: 'GLOBAL',
    name: 'Global Remote',
    slug: 'worldwide',
    aliases: ['remote', 'anywhere', 'distributed', 'work from anywhere', 'wfh'],
    tier: 1,
    isTechHub: true
  }
];
