const fs = require('fs');
const path = require('path');

console.log('Patching JobMatch OS into a Full Global Platform...');

// ==========================================
// 1. UPDATE JobMatchProduct.tsx
// ==========================================
const jobMatchFile = path.resolve('src/components/products/JobMatchProduct.tsx');
let jobMatchCode = fs.readFileSync(jobMatchFile, 'utf8');

// Ensure necessary lucide icons are imported
const neededIcons = ['Globe', 'Flame', 'Plane', 'Cpu', 'ShoppingBag', 'Radio', 'Gamepad2', 'Tv', 'Database', 'Layers', 'Compass'];
neededIcons.forEach(icon => {
  if (!jobMatchCode.includes(icon)) {
    jobMatchCode = jobMatchCode.replace(
      'import {',
      `import {\n  ${icon},`
    );
  }
});

// Update CategoryDef and expand CATEGORIES_DATA to 16 global sectors
const newCategoriesData = `interface CategoryDef {
  id: string;
  name: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  iconColor: string;
  keywords: string[];
}

export const GLOBAL_REGIONS = [
  { id: 'all', label: 'All Global Theaters', flag: '🌍', desc: 'Worldwide Network' },
  { id: 'india', label: 'India', flag: '🇮🇳', desc: 'Pan-India Tech & PSUs', keywords: ['india', 'bengaluru', 'mumbai', 'delhi', 'noida', 'gurugram', 'hyderabad', 'pune', 'chennai', 'kolkata', 'ahmedabad', 'jaipur', 'bhopal', 'indore', 'chandigarh'] },
  { id: 'middle-east', label: 'Middle East & GCC', flag: '🇦🇪', desc: 'Dubai, Riyadh & Doha', keywords: ['dubai', 'abu dhabi', 'riyadh', 'emirates', 'saudi', 'qatar', 'doha', 'gcc', 'oman', 'bahrain', 'kuwait', 'jeddah', 'manama', 'muscat', 'middle east'] },
  { id: 'africa', label: 'Africa', flag: '🇿🇦', desc: 'Lagos, Nairobi & Cape Town', keywords: ['nigeria', 'kenya', 'south africa', 'egypt', 'rwanda', 'ghana', 'morocco', 'lagos', 'nairobi', 'johannesburg', 'cape town', 'cairo', 'kigali', 'accra', 'casablanca', 'africa'] },
  { id: 'europe', label: 'Europe & UK', flag: '🇪🇺', desc: 'London, Berlin & Dublin', keywords: ['united kingdom', 'london', 'germany', 'berlin', 'amsterdam', 'netherlands', 'ireland', 'dublin', 'france', 'paris', 'switzerland', 'zurich', 'munich', 'brussels', 'sweden', 'stockholm', 'europe'] },
  { id: 'americas', label: 'Americas', flag: '🇺🇸', desc: 'USA & Canada Tech Hubs', keywords: ['united states', 'usa', 'new york', 'seattle', 'austin', 'san francisco', 'california', 'texas', 'canada', 'toronto', 'vancouver', 'atlanta', 'boston', 'chicago', 'washington', 'americas'] },
  { id: 'apac', label: 'Asia-Pacific', flag: '🌏', desc: 'Singapore, Tokyo & Sydney', keywords: ['singapore', 'australia', 'sydney', 'canberra', 'melbourne', 'japan', 'tokyo', 'apac'] },
  { id: 'remote', label: 'Worldwide Remote', flag: '🌐', desc: '100% Work from Anywhere', keywords: ['remote', 'worldwide', 'global', 'anywhere'] }
];

export const CATEGORIES_DATA: CategoryDef[] = [
  {
    id: 'it-software',
    name: 'Technology, Cloud & AI',
    count: 360,
    icon: Laptop,
    bg: 'bg-purple-50',
    iconColor: 'text-[#7138E8]',
    keywords: ['software', 'developer', 'engineer', 'frontend', 'backend', 'full stack', 'react', 'python', 'node', 'java', 'cloud', 'devops', 'platform', 'tech', 'web', 'system', 'architect', 'aws', 'kubernetes', 'sre']
  },
  {
    id: 'ai-data',
    name: 'AI & Data Science',
    count: 145,
    icon: Cpu,
    bg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    keywords: ['ai', 'artificial intelligence', 'data', 'machine learning', 'ml', 'deep learning', 'nlp', 'llm', 'pytorch', 'tensorflow', 'analytics', 'spark', 'snowflake', 'data science', 'big data']
  },
  {
    id: 'banking-finance',
    name: 'Banking, FinTech & Capital Markets',
    count: 240,
    icon: Coins,
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    keywords: ['bank', 'finance', 'fintech', 'account', 'audit', 'tax', 'credit', 'risk', 'analyst', 'wealth', 'investment', 'payments', 'crypto', 'blockchain', 'trading', 'fx', 'settlement', 'revolut', 'stripe', 'qnb', 'flutterwave', 'paystack']
  },
  {
    id: 'healthcare',
    name: 'Healthcare, Pharma & Biotech',
    count: 110,
    icon: Heart,
    bg: 'bg-red-50',
    iconColor: 'text-red-500',
    keywords: ['health', 'hospital', 'medical', 'clinical', 'pharma', 'pharmacy', 'nurse', 'doctor', 'biotech', 'laboratory', 'technician', 'healthcare', 'safety', 'life sciences', 'telemedicine']
  },
  {
    id: 'energy-cleantech',
    name: 'Energy, CleanTech & Oil & Gas',
    count: 95,
    icon: Flame,
    bg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    keywords: ['energy', 'oil', 'gas', 'petroleum', 'aramco', 'solar', 'wind', 'renewable', 'cleantech', 'climate', 'power', 'grid', 'utilities', 'sustainability', 'battery', 'iocl', 'bhel']
  },
  {
    id: 'consulting-strategy',
    name: 'Management Consulting & Strategy',
    count: 130,
    icon: Compass,
    bg: 'bg-blue-50',
    iconColor: 'text-[#2563EB]',
    keywords: ['consulting', 'strategy', 'advisory', 'mckinsey', 'bain', 'bcg', 'deloitte', 'ey', 'pwc', 'kpmg', 'corporate', 'management', 'analyst', 'transformation', 'mergers', 'legal']
  },
  {
    id: 'engineering',
    name: 'Core Engineering & Manufacturing',
    count: 160,
    icon: Cog,
    bg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    keywords: ['mechanical', 'civil', 'electrical', 'design', 'cad', 'cam', 'plant', 'manufacturing', 'industrial', 'quality', 'maintenance', 'semiconductor', 'asml', 'robotics', 'automotive', 'tata', 'ev', 'aerospace', 'hardware']
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain, Logistics & Maritime',
    count: 115,
    icon: Plane,
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    keywords: ['supply chain', 'logistics', 'warehouse', 'freight', 'procurement', 'shipping', 'cargo', 'aviation', 'emirates', 'noon', 'distribution', 'fulfillment', 'fleet', 'maritime', 'transport']
  },
  {
    id: 'sales-marketing',
    name: 'Sales, BD & Digital Growth',
    count: 155,
    icon: Megaphone,
    bg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    keywords: ['sales', 'marketing', 'business development', 'growth', 'customer', 'client', 'lead', 'brand', 'b2b', 'enterprise', 'digital marketing', 'seo', 'content', 'account manager', 'revenue', 'expansion']
  },
  {
    id: 'ecommerce-retail',
    name: 'Ecommerce & Consumer Brands',
    count: 120,
    icon: ShoppingBag,
    bg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    keywords: ['ecommerce', 'e-commerce', 'retail', 'fmcg', 'shopify', 'amazon', 'consumer', 'store', 'merchandising', 'brand', 'dtc', 'noon', 'marketplace', 'catalog']
  },
  {
    id: 'telecom-space',
    name: 'Telecom, 5G & SpaceTech',
    count: 85,
    icon: Radio,
    bg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    keywords: ['telecom', 'telecommunications', '5g', 'network', 'satellite', 'spacetech', 'isro', 'airtel', 'safaricom', 'spectrum', 'fiber', 'broadband', 'wireless', 'rf']
  },
  {
    id: 'human-resources',
    name: 'People, HR & Global Mobility',
    count: 80,
    icon: Users,
    bg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    keywords: ['hr', 'human resources', 'recruiter', 'recruitment', 'talent', 'hiring', 'payroll', 'people', 'staffing', 'onboarding', 'mobility', 'compensation', 'benefits', 'culture']
  },
  {
    id: 'education',
    name: 'Education, EdTech & Academic',
    count: 65,
    icon: GraduationCap,
    bg: 'bg-lime-50',
    iconColor: 'text-lime-700',
    keywords: ['education', 'trainer', 'training', 'teacher', 'faculty', 'professor', 'academic', 'tutor', 'curriculum', 'instructor', 'mentor', 'university', 'research', 'edtech', 'learning']
  },
  {
    id: 'real-estate',
    name: 'Real Estate, PropTech & Infra',
    count: 70,
    icon: Building2,
    bg: 'bg-stone-50',
    iconColor: 'text-stone-700',
    keywords: ['real estate', 'property', 'proptech', 'infrastructure', 'urban', 'construction', 'architecture', 'civil', 'facilities', 'commercial', 'leasing']
  },
  {
    id: 'media-gaming',
    name: 'Media, Design & Gaming',
    count: 75,
    icon: Gamepad2,
    bg: 'bg-fuchsia-50',
    iconColor: 'text-fuchsia-600',
    keywords: ['gaming', 'game', 'media', 'design', 'ui', 'ux', 'creative', 'animation', 'video', 'content', 'streaming', 'audio', 'spotify', 'entertainment', 'graphics']
  },
  {
    id: 'government-defense',
    name: 'Government, Defense & Public Sector',
    count: 88,
    icon: ShieldCheck,
    bg: 'bg-slate-50',
    iconColor: 'text-slate-700',
    keywords: ['government', 'psu', 'defense', 'public sector', 'drdo', 'bhel', 'isro', 'ministry', 'military', 'aerospace', 'sovereign', 'civil service', 'policy']
  }
];`;

// Replace CATEGORIES_DATA definition in JobMatchProduct.tsx
const catStart = jobMatchCode.indexOf('interface CategoryDef {');
const catEnd = jobMatchCode.indexOf('function generateSlug(');
if (catStart !== -1 && catEnd !== -1) {
  jobMatchCode = jobMatchCode.substring(0, catStart) + newCategoriesData + '\n\n' + jobMatchCode.substring(catEnd);
  console.log('✓ Replaced CATEGORIES_DATA and added GLOBAL_REGIONS');
}

// Add selectedRegion state
if (!jobMatchCode.includes('const [selectedRegion, setSelectedRegion]')) {
  jobMatchCode = jobMatchCode.replace(
    'const [selectedCategory8, setSelectedCategory8] = useState<string>(\'all\');',
    `const [selectedCategory8, setSelectedCategory8] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');`
  );
  console.log('✓ Added selectedRegion state');
}

// Update filteredJobs to support selectedRegion
const filterJobsOld = `// 8 Category filter
      if (selectedCategory8 !== 'all') {`;

const filterJobsWithRegion = `// Global Theater / Region filter
      if (selectedRegion !== 'all') {
        const regionDef = GLOBAL_REGIONS.find(r => r.id === selectedRegion);
        if (regionDef && regionDef.keywords) {
          const locStr = \`\${job.location || ''} \${job.location_city || ''} \${job.location_state || ''}\`.toLowerCase();
          const isRemote = job.is_remote || locStr.includes('remote');
          if (selectedRegion === 'remote') {
            if (!isRemote) return false;
          } else {
            const matchesRegion = regionDef.keywords.some(k => locStr.includes(k));
            if (!matchesRegion && !isRemote) return false;
          }
        }
      }

      // 16 Category filter
      if (selectedCategory8 !== 'all') {`;

if (jobMatchCode.includes(filterJobsOld)) {
  jobMatchCode = jobMatchCode.replace(filterJobsOld, filterJobsWithRegion);
  console.log('✓ Updated filteredJobs with selectedRegion logic');
}

// Enhance formatSalary for Global Multi-Currency Display
const oldFormatSalary = `function formatSalary(min?: number, max?: number): string | null {
  if (!min || min <= 0) return null;
  const minLakhs = (min / 100000).toFixed(0);
  if (!max || max === min) return \`₹\${minLakhs} LPA\`;
  const maxLakhs = (max / 100000).toFixed(0);
  return \`₹\${minLakhs} – \${maxLakhs} LPA\`;
}`;

const newFormatSalary = `function formatSalary(min?: number, max?: number, location?: string): string | null {
  if (!min || min <= 0) return null;
  const loc = (location || '').toLowerCase();
  const isUS = loc.includes('united states') || loc.includes('usa') || loc.includes('austin') || loc.includes('seattle') || loc.includes('new york') || loc.includes('san francisco');
  const isUK = loc.includes('united kingdom') || loc.includes('london');
  const isEU = loc.includes('germany') || loc.includes('amsterdam') || loc.includes('netherlands') || loc.includes('ireland') || loc.includes('dublin') || loc.includes('berlin');
  const isGulf = loc.includes('dubai') || loc.includes('emirates') || loc.includes('saudi') || loc.includes('riyadh') || loc.includes('qatar') || loc.includes('doha');
  const isAfrica = loc.includes('nigeria') || loc.includes('kenya') || loc.includes('south africa') || loc.includes('egypt') || loc.includes('rwanda');

  // International formatting
  if (isUS && min >= 500000) {
    const usdMin = Math.round(min / 100000 * 1.2);
    const usdMax = max ? Math.round(max / 100000 * 1.2) : usdMin + 30;
    return \`$\${usdMin}k – $\${usdMax}k / yr\`;
  }
  if (isUK && min >= 500000) {
    const gbpMin = Math.round(min / 100000 * 0.95);
    const gbpMax = max ? Math.round(max / 100000 * 0.95) : gbpMin + 25;
    return \`£\${gbpMin}k – £\${gbpMax}k / yr\`;
  }
  if (isEU && min >= 500000) {
    const eurMin = Math.round(min / 100000 * 1.1);
    const eurMax = max ? Math.round(max / 100000 * 1.1) : eurMin + 30;
    return \`€\${eurMin}k – €\${eurMax}k / yr\`;
  }
  if (isGulf && min >= 500000) {
    const aedMin = Math.round((min / 100000) * 4.4);
    const aedMax = max ? Math.round((max / 100000) * 4.4) : aedMin + 100;
    return \`AED \${aedMin}k – \${aedMax}k / yr\`;
  }
  if (isAfrica && min >= 500000) {
    const minL = (min / 100000).toFixed(0);
    const maxL = max ? (max / 100000).toFixed(0) : minL;
    return \`$\${Math.round(min / 100000 * 0.9)}k – $\${Math.round((max || min) / 100000 * 0.9)}k (Global)\`;
  }

  // Standard Indian LPA formatting
  const minLakhs = (min / 100000).toFixed(0);
  if (!max || max === min) return \`₹\${minLakhs} LPA\`;
  const maxLakhs = (max / 100000).toFixed(0);
  return \`₹\${minLakhs} – \${maxLakhs} LPA\`;
}`;

if (jobMatchCode.includes(oldFormatSalary)) {
  jobMatchCode = jobMatchCode.replace(oldFormatSalary, newFormatSalary);
  console.log('✓ Updated formatSalary with multi-currency global intelligence');
}

// Pass job.location to formatSalary invocation
jobMatchCode = jobMatchCode.replace(
  'const salaryStr = formatSalary(job.salary_min, job.salary_max) || \'Best in Industry\';',
  'const salaryStr = formatSalary(job.salary_min, job.salary_max, job.location) || \'Best in Industry\';'
);

// Now update the Hero Badge, Title, Global Region Strip, and Location Dropdown
const oldHeroPill = `<div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50/80 border border-blue-200/60 text-[#2563EB] text-xs font-bold shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Next-Gen Employment Marketplace • AI-POWERED</span>
                    </div>`;

const newHeroPill = `<div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50/90 border border-blue-200 text-[#2563EB] text-xs font-bold shadow-2xs">
                      <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Global Employment Ecosystem • India • Middle East • Africa • Europe • Americas</span>
                    </div>`;

jobMatchCode = jobMatchCode.replace(oldHeroPill, newHeroPill);

// Update H1 title
jobMatchCode = jobMatchCode.replace(
  'for Your <span className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] bg-clip-text text-transparent">Next Career Move</span>',
  'for Your <span className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] bg-clip-text text-transparent">Next Global Career Move</span>'
);

// Update subtitle
jobMatchCode = jobMatchCode.replace(
  'Discover verified vacancies with zero ghost listings, match your profile with next-gen AI compatibility scoring, and apply with 1-click Career Passport.',
  'Connecting verified professionals with 2,250+ unexpired vacancies across India, Africa, Middle East, Europe & Americas. Zero ghost listings, transparent compensation benchmarks, and AI match routing.'
);

// Replace Location Dropdown with comprehensive Global Theaters
const oldLocationSelect = `<select 
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full text-xs sm:text-sm text-[#334155] bg-transparent focus:outline-hidden cursor-pointer"
                      >
                        <option value="all">All Locations</option>
                        <option value="remote">Remote (Pan-India)</option>
                        <option value="bengaluru">Bengaluru</option>
                        <option value="mumbai">Mumbai</option>
                        <option value="delhi">Delhi NCR / Noida</option>
                        <option value="hyderabad">Hyderabad</option>
                        <option value="pune">Pune</option>
                        <option value="chennai">Chennai</option>
                        <option value="kolkata">Kolkata</option>
                      </select>`;

const newLocationSelect = `<select 
                        value={selectedCity}
                        onChange={(e) => {
                          setSelectedCity(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full text-xs sm:text-sm text-[#334155] bg-transparent focus:outline-hidden cursor-pointer font-medium"
                      >
                        <option value="all">🌍 All Global Locations (Worldwide)</option>
                        <option value="remote">🌐 100% Worldwide Remote (Work Anywhere)</option>

                        <optgroup label="🇮🇳 India & South Asia">
                          <option value="bengaluru">Bengaluru (India)</option>
                          <option value="mumbai">Mumbai (India)</option>
                          <option value="delhi">Delhi NCR / Noida / Gurugram (India)</option>
                          <option value="hyderabad">Hyderabad (India)</option>
                          <option value="pune">Pune (India)</option>
                          <option value="chennai">Chennai (India)</option>
                          <option value="kolkata">Kolkata (India)</option>
                          <option value="ahmedabad">Ahmedabad (India)</option>
                        </optgroup>

                        <optgroup label="🇦🇪 Middle East & GCC">
                          <option value="dubai">Dubai (United Arab Emirates)</option>
                          <option value="abu dhabi">Abu Dhabi (UAE)</option>
                          <option value="riyadh">Riyadh (Saudi Arabia)</option>
                          <option value="doha">Doha (Qatar)</option>
                          <option value="muscat">Muscat (Oman)</option>
                        </optgroup>

                        <optgroup label="🇿🇦 Africa & Emerging Markets">
                          <option value="lagos">Lagos (Nigeria)</option>
                          <option value="nairobi">Nairobi (Kenya)</option>
                          <option value="cape town">Cape Town (South Africa)</option>
                          <option value="johannesburg">Johannesburg (South Africa)</option>
                          <option value="cairo">Cairo (Egypt)</option>
                          <option value="kigali">Kigali (Rwanda)</option>
                          <option value="accra">Accra (Ghana)</option>
                        </optgroup>

                        <optgroup label="🇪🇺 Europe & United Kingdom">
                          <option value="london">London (United Kingdom)</option>
                          <option value="berlin">Berlin (Germany)</option>
                          <option value="amsterdam">Amsterdam (Netherlands)</option>
                          <option value="dublin">Dublin (Ireland)</option>
                          <option value="munich">Munich (Germany)</option>
                          <option value="paris">Paris (France)</option>
                          <option value="zurich">Zurich (Switzerland)</option>
                        </optgroup>

                        <optgroup label="🇺🇸 Americas (USA & Canada)">
                          <option value="new york">New York, NY (USA)</option>
                          <option value="seattle">Seattle, WA (USA)</option>
                          <option value="austin">Austin, TX (USA)</option>
                          <option value="san francisco">San Francisco / Silicon Valley (USA)</option>
                          <option value="atlanta">Atlanta, GA (USA)</option>
                          <option value="toronto">Toronto, ON (Canada)</option>
                          <option value="vancouver">Vancouver, BC (Canada)</option>
                        </optgroup>

                        <optgroup label="🌏 Asia-Pacific & Australia">
                          <option value="singapore">Singapore</option>
                          <option value="sydney">Sydney (Australia)</option>
                          <option value="melbourne">Melbourne (Australia)</option>
                          <option value="tokyo">Tokyo (Japan)</option>
                        </optgroup>
                      </select>`;

jobMatchCode = jobMatchCode.replace(oldLocationSelect, newLocationSelect);
console.log('✓ Replaced Location Dropdown with Global Theaters');

// Add the Global Region Quick Filter Strip right above Search Bar
const oldSearchContainer = `<div className="mt-6 space-y-3">
                  
                  {/* Primary Search Bar */}`;

const newSearchContainer = `<div className="mt-6 space-y-3">
                  
                  {/* Global Region Theater Selector Strip */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs">
                    <span className="text-[#64748B] font-bold text-[11px] shrink-0 mr-1 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Global Theater:</span>
                    </span>
                    {GLOBAL_REGIONS.map(reg => {
                      const isActive = selectedRegion === reg.id;
                      return (
                        <button
                          key={reg.id}
                          type="button"
                          onClick={() => {
                            setSelectedRegion(reg.id);
                            setCurrentPage(1);
                          }}
                          className={\`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer \${
                            isActive
                              ? 'bg-[#2563EB] text-white shadow-xs'
                              : 'bg-white text-[#475569] hover:bg-slate-100 border border-[#E2E8F0]'
                          }\`}
                        >
                          <span>{reg.flag}</span>
                          <span>{reg.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Primary Search Bar */}`;

jobMatchCode = jobMatchCode.replace(oldSearchContainer, newSearchContainer);
console.log('✓ Added Global Region Theater Selector Strip');

// Update Industry Filter in Hero to list all 16 Global Industries
const oldIndustryFilter = `<select 
                        value={selectedIndustry}
                        onChange={(e) => setSelectedIndustry(e.target.value)}
                        className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#334155] focus:outline-hidden cursor-pointer hover:border-slate-300"
                      >
                        <option value="all">Industry ▾</option>
                        {CATEGORIES_DATA.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>`;

const newIndustryFilter = `<select 
                        value={selectedIndustry}
                        onChange={(e) => {
                          setSelectedIndustry(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#334155] focus:outline-hidden cursor-pointer hover:border-slate-300"
                      >
                        <option value="all">16 Global Industries ▾</option>
                        {CATEGORIES_DATA.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>`;

jobMatchCode = jobMatchCode.replace(oldIndustryFilter, newIndustryFilter);

// Update the Category Grid section to show 16 categories with responsive grid
const oldCatGrid = `<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {CATEGORIES_DATA.map(cat => {`;

const newCatGrid = `<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {CATEGORIES_DATA.map(cat => {`;

// The map is already dynamic! It will automatically render all 16 categories!

// Reset filter logic update to also clear selectedRegion
jobMatchCode = jobMatchCode.replace(
  'setSelectedCategory8(\'all\');',
  'setSelectedCategory8(\'all\');\n    setSelectedRegion(\'all\');'
);

fs.writeFileSync(jobMatchFile, jobMatchCode, 'utf8');
console.log('Successfully updated JobMatchProduct.tsx!');
