const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/components/products/jobmatch/JobPortalDiscoveryGrid.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// Expanded Global Locations
const newLocations = `export const REAL_PORTAL_LOCATIONS: LocationCardData[] = [
  { id: 'loc-remote', city: 'Worldwide Remote', state: 'Work from Anywhere', count: 110, slug: 'remote' },
  { id: 'loc-dubai', city: 'Dubai', state: 'United Arab Emirates', count: 28, slug: 'dubai' },
  { id: 'loc-riyadh', city: 'Riyadh', state: 'Saudi Arabia', count: 22, slug: 'riyadh' },
  { id: 'loc-lagos', city: 'Lagos', state: 'Nigeria (Africa)', count: 25, slug: 'lagos' },
  { id: 'loc-nairobi', city: 'Nairobi', state: 'Kenya (Africa)', count: 20, slug: 'nairobi' },
  { id: 'loc-capetown', city: 'Cape Town & Joburg', state: 'South Africa', count: 24, slug: 'south africa' },
  { id: 'loc-cairo', city: 'Cairo', state: 'Egypt (North Africa)', count: 18, slug: 'cairo' },
  { id: 'loc-london', city: 'London', state: 'United Kingdom', count: 32, slug: 'london' },
  { id: 'loc-berlin', city: 'Berlin', state: 'Germany (Europe)', count: 26, slug: 'berlin' },
  { id: 'loc-amsterdam', city: 'Amsterdam', state: 'Netherlands', count: 22, slug: 'amsterdam' },
  { id: 'loc-dublin', city: 'Dublin', state: 'Ireland (EU Hub)', count: 24, slug: 'dublin' },
  { id: 'loc-newyork', city: 'New York, NY', state: 'United States', count: 35, slug: 'new york' },
  { id: 'loc-sanfrancisco', city: 'San Francisco / Bay Area', state: 'California, USA', count: 38, slug: 'san francisco' },
  { id: 'loc-seattle', city: 'Seattle, WA', state: 'Washington, USA', count: 29, slug: 'seattle' },
  { id: 'loc-austin', city: 'Austin, TX', state: 'Texas, USA', count: 27, slug: 'austin' },
  { id: 'loc-toronto', city: 'Toronto', state: 'Ontario, Canada', count: 25, slug: 'toronto' },
  { id: 'loc-singapore', city: 'Singapore', state: 'Southeast Asia Hub', count: 30, slug: 'singapore' },
  { id: 'loc-sydney', city: 'Sydney & Melbourne', state: 'Australia (ANZ)', count: 26, slug: 'sydney' },
  { id: 'loc-bangalore', city: 'Bengaluru', state: 'Karnataka, India', count: 52, slug: 'bengaluru' },
  { id: 'loc-mumbai', city: 'Mumbai', state: 'Maharashtra, India', count: 53, slug: 'mumbai' },
  { id: 'loc-delhi', city: 'Delhi NCR / Noida', state: 'NCR, India', count: 50, slug: 'delhi' },
  { id: 'loc-hyderabad', city: 'Hyderabad', state: 'Telangana, India', count: 51, slug: 'hyderabad' },
  { id: 'loc-pune', city: 'Pune', state: 'Maharashtra, India', count: 48, slug: 'pune' },
  { id: 'loc-chennai', city: 'Chennai', state: 'Tamil Nadu, India', count: 45, slug: 'chennai' }
];`;

// Expanded Global Companies
const newCompanies = `export const REAL_PORTAL_COMPANIES: CompanyCardData[] = [
  { id: 'comp-flutterwave', name: 'Flutterwave', industry: 'FinTech & African Payments', location: 'Lagos, Nigeria', count: 18, verified: true, slug: 'flutterwave' },
  { id: 'comp-paystack', name: 'Paystack (Stripe)', industry: 'Payment Rails & Settlement', location: 'Cape Town / Dublin', count: 22, verified: true, slug: 'paystack' },
  { id: 'comp-standardbank', name: 'Standard Bank Group', industry: 'Pan-African Corporate Banking', location: 'Johannesburg, South Africa', count: 26, verified: true, slug: 'standard-bank' },
  { id: 'comp-andela', name: 'Andela', industry: 'Global Remote Engineering', location: 'Nairobi, Kenya', count: 19, verified: true, slug: 'andela' },
  { id: 'comp-safaricom', name: 'Safaricom (M-Pesa)', industry: 'Telecom & Mobile Finance', location: 'Nairobi, Kenya', count: 15, verified: true, slug: 'safaricom' },
  { id: 'comp-careem', name: 'Careem (Uber MENA)', industry: 'Mobility & SuperApp', location: 'Dubai, UAE', count: 24, verified: true, slug: 'careem' },
  { id: 'comp-aramco', name: 'Aramco Digital', industry: 'Industrial Cloud & AI', location: 'Riyadh, Saudi Arabia', count: 28, verified: true, slug: 'aramco-digital' },
  { id: 'comp-emirates', name: 'Emirates Group', industry: 'Global Aviation & Logistics', location: 'Dubai, UAE', count: 25, verified: true, slug: 'emirates-group' },
  { id: 'comp-revolut', name: 'Revolut', industry: 'Global Financial App', location: 'London, UK / Remote', count: 32, verified: true, slug: 'revolut' },
  { id: 'comp-spotify', name: 'Spotify', industry: 'Audio Streaming & AI', location: 'Berlin / Stockholm', count: 20, verified: true, slug: 'spotify' },
  { id: 'comp-asml', name: 'ASML', industry: 'Semiconductor Lithography', location: 'Amsterdam, Netherlands', count: 22, verified: true, slug: 'asml' },
  { id: 'comp-microsoft', name: 'Microsoft', industry: 'Hyperscale Cloud & AI', location: 'Seattle, WA, USA', count: 42, verified: true, slug: 'microsoft' },
  { id: 'comp-aws', name: 'Amazon Web Services (AWS)', industry: 'Cloud Infrastructure', location: 'Austin, TX / Remote', count: 48, verified: true, slug: 'aws' },
  { id: 'comp-shopify', name: 'Shopify', industry: 'Global Digital Commerce', location: 'Toronto, Canada', count: 26, verified: true, slug: 'shopify' },
  { id: 'comp-grab', name: 'Grab Financial Group', industry: 'Digital Banking & SuperApp', location: 'Singapore', count: 27, verified: true, slug: 'grab' },
  { id: 'comp-atlassian', name: 'Atlassian', industry: 'Collaboration Software', location: 'Sydney, Australia', count: 24, verified: true, slug: 'atlassian' },
  { id: 'comp-tcs', name: 'Tata Consultancy Services (TCS)', industry: 'IT & Enterprise Consulting', location: 'Pan-India / Global', count: 50, verified: true, slug: 'tcs' },
  { id: 'comp-infosys', name: 'Infosys Limited', industry: 'Software & Digital Services', location: 'Bengaluru / Global', count: 30, verified: true, slug: 'infosys' },
  { id: 'comp-hdfc', name: 'HDFC Bank', industry: 'Banking & Financial Services', location: 'Mumbai / India', count: 28, verified: true, slug: 'hdfc-bank' },
  { id: 'comp-wipro', name: 'Wipro Technologies', industry: 'Information Technology', location: 'Bengaluru / Global', count: 27, verified: true, slug: 'wipro' }
];`;

const locStart = code.indexOf('export const REAL_PORTAL_LOCATIONS: LocationCardData[] = [');
const locEnd = code.indexOf('export const REAL_PORTAL_COMPANIES: CompanyCardData[] = [');
const compEnd = code.indexOf('interface JobPortalDiscoveryGridProps {');

if (locStart !== -1 && locEnd !== -1 && compEnd !== -1) {
  code = code.substring(0, locStart) + newLocations + '\n\n' + newCompanies + '\n\n' + code.substring(compEnd);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Successfully updated JobPortalDiscoveryGrid.tsx with Global Locations & Companies!');
} else {
  console.error('Could not find markers in JobPortalDiscoveryGrid.tsx');
}
