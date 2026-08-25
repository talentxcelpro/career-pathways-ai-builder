// src/lib/seo/searchUniverse/locationExpansionEngine.ts
// Authoritative Geographic Locations & Tech Hubs

export interface LocationDefinition {
  name: string;
  tier: 1 | 2 | 3;
  region: 'NORTH' | 'SOUTH' | 'WEST' | 'EAST' | 'CENTRAL' | 'NATIONAL' | 'REMOTE';
  slug: string;
}

export const CANONICAL_LOCATIONS: LocationDefinition[] = [
  // National & Remote
  { name: 'India', tier: 1, region: 'NATIONAL', slug: 'india' },
  { name: 'Remote', tier: 1, region: 'REMOTE', slug: 'remote' },
  { name: 'Hybrid', tier: 1, region: 'REMOTE', slug: 'hybrid' },

  // Tier 1 Major Tech Hubs
  { name: 'Noida', tier: 1, region: 'NORTH', slug: 'noida' },
  { name: 'Delhi NCR', tier: 1, region: 'NORTH', slug: 'delhi-ncr' },
  { name: 'Gurgaon', tier: 1, region: 'NORTH', slug: 'gurgaon' },
  { name: 'Bangalore', tier: 1, region: 'SOUTH', slug: 'bangalore' },
  { name: 'Hyderabad', tier: 1, region: 'SOUTH', slug: 'hyderabad' },
  { name: 'Pune', tier: 1, region: 'WEST', slug: 'pune' },
  { name: 'Mumbai', tier: 1, region: 'WEST', slug: 'mumbai' },
  { name: 'Chennai', tier: 1, region: 'SOUTH', slug: 'chennai' },

  // Tier 2 Emerging Tech & Industrial Centers
  { name: 'Kolkata', tier: 2, region: 'EAST', slug: 'kolkata' },
  { name: 'Ahmedabad', tier: 2, region: 'WEST', slug: 'ahmedabad' },
  { name: 'Jaipur', tier: 2, region: 'NORTH', slug: 'jaipur' },
  { name: 'Chandigarh', tier: 2, region: 'NORTH', slug: 'chandigarh' },
  { name: 'Lucknow', tier: 2, region: 'NORTH', slug: 'lucknow' },
  { name: 'Kochi', tier: 2, region: 'SOUTH', slug: 'kochi' },
  { name: 'Coimbatore', tier: 2, region: 'SOUTH', slug: 'coimbatore' },
  { name: 'Indore', tier: 2, region: 'CENTRAL', slug: 'indore' },
  { name: 'Bhopal', tier: 2, region: 'CENTRAL', slug: 'bhopal' },
  { name: 'Nagpur', tier: 2, region: 'WEST', slug: 'nagpur' },
  { name: 'Bhubaneswar', tier: 2, region: 'EAST', slug: 'bhubaneswar' },
  { name: 'Visakhapatnam', tier: 2, region: 'SOUTH', slug: 'visakhapatnam' },
  { name: 'Thiruvananthapuram', tier: 2, region: 'SOUTH', slug: 'thiruvananthapuram' },
  { name: 'Surat', tier: 2, region: 'WEST', slug: 'surat' },
  { name: 'Vadodara', tier: 2, region: 'WEST', slug: 'vadodara' },
  { name: 'Patna', tier: 2, region: 'EAST', slug: 'patna' },
  { name: 'Dehradun', tier: 2, region: 'NORTH', slug: 'dehradun' },
];

export const ALL_LOCATION_NAMES = CANONICAL_LOCATIONS.map((l) => l.name);
