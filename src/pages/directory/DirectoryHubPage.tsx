import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Search, Building, MapPin, Briefcase, GraduationCap, TrendingUp, Sparkles, ChevronRight, Layers, ExternalLink } from 'lucide-react';
import { SubdomainMeshFooter } from '@/components/navigation/SubdomainMeshFooter';

const TOP_STATES_DATA = [
  {
    state: 'Uttar Pradesh',
    cities: ['Varanasi', 'Noida', 'Lucknow', 'Kanpur', 'Prayagraj', 'Agra', 'Ghaziabad', 'Bareilly'],
    topColleges: [
      { name: 'IIT (BHU) Varanasi', slug: 'indian-institute-of-technology-bhu-varanasi' },
      { name: 'Banaras Hindu University (BHU)', slug: 'banaras-hindu-university-varanasi' },
      { name: 'IIT Kanpur', slug: 'indian-institute-of-technology-kanpur' },
      { name: 'Amity University Noida', slug: 'amity-university-noida' },
      { name: 'IIM Lucknow', slug: 'indian-institute-of-management-lucknow' },
      { name: 'MNNIT Allahabad', slug: 'motilal-nehru-national-institute-of-technology-allahabad' }
    ]
  },
  {
    state: 'Karnataka',
    cities: ['Bangalore', 'Mysuru', 'Mangalore', 'Hubli', 'Belgaum'],
    topColleges: [
      { name: 'IISc Bangalore', slug: 'indian-institute-of-science-bangalore' },
      { name: 'IIM Bangalore', slug: 'indian-institute-of-management-bangalore' },
      { name: 'RV College of Engineering', slug: 'rv-college-of-engineering-bangalore' },
      { name: 'BMS College of Engineering', slug: 'bms-college-of-engineering-bangalore' },
      { name: 'PES University', slug: 'pes-university-bangalore' },
      { name: 'NIT Karnataka Surathkal', slug: 'national-institute-of-technology-karnataka-surathkal' }
    ]
  },
  {
    state: 'Maharashtra',
    cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur'],
    topColleges: [
      { name: 'IIT Bombay', slug: 'indian-institute-of-technology-bombay' },
      { name: 'COEP Pune', slug: 'college-of-engineering-pune' },
      { name: 'VJTI Mumbai', slug: 'veermata-jijabai-technological-institute-mumbai' },
      { name: 'SP Jain Institute of Management', slug: 'sp-jain-institute-of-management-and-research-mumbai' },
      { name: 'VNIT Nagpur', slug: 'visvesvaraya-national-institute-of-technology-nagpur' },
      { name: 'Symbiosis International University', slug: 'symbiosis-international-university-pune' }
    ]
  },
  {
    state: 'Delhi NCR',
    cities: ['New Delhi', 'Gurugram', 'Noida', 'Faridabad'],
    topColleges: [
      { name: 'IIT Delhi', slug: 'indian-institute-of-technology-delhi' },
      { name: 'Delhi Technological University (DTU)', slug: 'delhi-technological-university' },
      { name: 'Netaji Subhas University of Technology (NSUT)', slug: 'netaji-subhas-university-of-technology' },
      { name: 'Faculty of Management Studies (FMS)', slug: 'faculty-of-management-studies-delhi' },
      { name: 'Jamia Millia Islamia', slug: 'jamia-millia-islamia-new-delhi' },
      { name: 'IIIT Delhi', slug: 'indraprastha-institute-of-information-technology-delhi' }
    ]
  },
  {
    state: 'Tamil Nadu',
    cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
    topColleges: [
      { name: 'IIT Madras', slug: 'indian-institute-of-technology-madras' },
      { name: 'NIT Trichy', slug: 'national-institute-of-technology-tiruchirappalli' },
      { name: 'Anna University Chennai', slug: 'anna-university-chennai' },
      { name: 'PSG College of Technology', slug: 'psg-college-of-technology-coimbatore' },
      { name: 'Vellore Institute of Technology (VIT)', slug: 'vellore-institute-of-technology-vellore' },
      { name: 'SRM Institute of Science and Technology', slug: 'srm-institute-of-science-and-technology-chennai' }
    ]
  },
  {
    state: 'Telangana',
    cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
    topColleges: [
      { name: 'IIT Hyderabad', slug: 'indian-institute-of-technology-hyderabad' },
      { name: 'NIT Warangal', slug: 'national-institute-of-technology-warangal' },
      { name: 'IIIT Hyderabad', slug: 'international-institute-of-information-technology-hyderabad' },
      { name: 'BITS Pilani Hyderabad Campus', slug: 'bits-pilani-hyderabad-campus' },
      { name: 'Osmania University', slug: 'osmania-university-hyderabad' }
    ]
  },
  {
    state: 'Gujarat',
    cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
    topColleges: [
      { name: 'IIM Ahmedabad', slug: 'indian-institute-of-management-ahmedabad' },
      { name: 'IIT Gandhinagar', slug: 'indian-institute-of-technology-gandhinagar' },
      { name: 'SVNIT Surat', slug: 'sardar-vallabhbhai-national-institute-of-technology-surat' },
      { name: 'DA-IICT Gandhinagar', slug: 'dhirubhai-ambani-institute-of-information-and-communication-technology' }
    ]
  },
  {
    state: 'Rajasthan',
    cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
    topColleges: [
      { name: 'BITS Pilani', slug: 'birla-institute-of-technology-and-science-pilani' },
      { name: 'MNIT Jaipur', slug: 'malaviya-national-institute-of-technology-jaipur' },
      { name: 'IIT Jodhpur', slug: 'indian-institute-of-technology-jodhpur' },
      { name: 'IIM Udaipur', slug: 'indian-institute-of-management-udaipur' }
    ]
  },
  {
    state: 'West Bengal',
    cities: ['Kolkata', 'Durgapur', 'Siliguri', 'Asansol'],
    topColleges: [
      { name: 'IIT Kharagpur', slug: 'indian-institute-of-technology-kharagpur' },
      { name: 'IIM Calcutta', slug: 'indian-institute-of-management-calcutta' },
      { name: 'Jadavpur University', slug: 'jadavpur-university-kolkata' },
      { name: 'NIT Durgapur', slug: 'national-institute-of-technology-durgapur' },
      { name: 'IIEST Shibpur', slug: 'indian-institute-of-engineering-science-and-technology-shibpur' }
    ]
  },
  {
    state: 'Madhya Pradesh',
    cities: ['Indore', 'Bhopal', 'Gwalior', 'Jabalpur'],
    topColleges: [
      { name: 'IIT Indore', slug: 'indian-institute-of-technology-indore' },
      { name: 'IIM Indore', slug: 'indian-institute-of-management-indore' },
      { name: 'MANIT Bhopal', slug: 'maulana-azad-national-institute-of-technology-bhopal' },
      { name: 'IIITM Gwalior', slug: 'atal-bihari-vajpayee-indian-institute-of-information-technology-and-management' }
    ]
  }
];

const HIGH_INTENT_JOB_HUBS = [
  { city: 'Varanasi', path: '/locations/varanasi', category: 'Tier-2 High Growth', roles: ['Software Engineer', 'Bank Officer', 'Academic Faculty', 'Data Analyst'] },
  { city: 'Noida', path: '/locations/noida', category: 'Major IT Corridor', roles: ['Full Stack Developer', 'Cloud Architect', 'DevOps', 'Sales Executive'] },
  { city: 'Lucknow', path: '/locations/lucknow', category: 'Regional Tech & Healthcare', roles: ['IT Support', 'Healthcare Admin', 'Java Developer'] },
  { city: 'Bangalore', path: '/locations/bangalore', category: 'India Silicon Valley', roles: ['Staff Engineer', 'AI Research', 'Frontend Lead', 'Product Manager'] },
  { city: 'Pune', path: '/locations/pune', category: 'IT & Automotive Hub', roles: ['Automotive Embedded', 'DevOps Engineer', 'React Developer'] },
  { city: 'Hyderabad', path: '/locations/hyderabad', category: 'HITEC Tech Capital', roles: ['Cloud Engineer', 'Data Scientist', 'Bioinformatics'] },
  { city: 'Chennai', path: '/locations/chennai', category: 'SaaS & Automotive Hub', roles: ['SaaS Architect', 'Mechanical Engineer', 'Python Developer'] },
  { city: 'Mumbai', path: '/locations/mumbai', category: 'Financial Capital', roles: ['Investment Banker', 'Quantitative Analyst', 'Full Stack'] },
  { city: 'Delhi NCR', path: '/locations/delhi', category: 'National Corporate Hub', roles: ['Consultant', 'Cybersecurity', 'Operations Lead'] },
  { city: 'Indore', path: '/locations/indore', category: 'Emerging Tech Tier-2', roles: ['Software Developer', 'QA Automation', 'Business Analyst'] },
  { city: 'Bhopal', path: '/locations/bhopal', category: 'Tier-2 Tech & Govt', roles: ['Frontend Developer', 'System Admin', 'Content Strategist'] },
  { city: 'Chandigarh', path: '/locations/chandigarh', category: 'North Tech Corridor', roles: ['React Native', 'DevOps', 'Digital Growth'] },
  { city: 'Jaipur', path: '/locations/jaipur', category: 'Tier-2 IT Services', roles: ['Full Stack', 'Cloud Architect', 'Tax Auditor'] },
  { city: 'Coimbatore', path: '/locations/coimbatore', category: 'South Manufacturing & Tech', roles: ['Embedded Systems', 'QA Engineer', 'Operations'] },
  { city: 'Kochi', path: '/locations/kochi', category: 'Infopark Tech Corridor', roles: ['Flutter Developer', 'Node.js Engineer', 'AI Specialist'] },
  { city: 'Bhubaneswar', path: '/locations/bhubaneswar', category: 'Eastern Tech Hub', roles: ['Java Engineer', 'Cloud Developer', 'Procurement'] }
];

const POPULAR_SALARY_BENCHMARKS = [
  { role: 'Software Engineer', path: 'https://salary.talentxcel.in/salary/software-engineer', avg: '₹8.5L' },
  { role: 'Data Scientist', path: 'https://salary.talentxcel.in/salary/data-scientist', avg: '₹12.0L' },
  { role: 'DevOps Engineer', path: 'https://salary.talentxcel.in/salary/devops-engineer', avg: '₹11.2L' },
  { role: 'Frontend Engineer', path: 'https://salary.talentxcel.in/salary/frontend-engineer', avg: '₹7.8L' },
  { role: 'Backend Engineer', path: 'https://salary.talentxcel.in/salary/backend-engineer', avg: '₹9.4L' },
  { role: 'Product Manager', path: 'https://salary.talentxcel.in/salary/product-manager', avg: '₹16.5L' },
  { role: 'AI / ML Engineer', path: 'https://salary.talentxcel.in/salary/ai-ml-engineer', avg: '₹14.0L' },
  { role: 'Full Stack Developer', path: 'https://salary.talentxcel.in/salary/full-stack-developer', avg: '₹9.0L' }
];

export const DirectoryHubPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStates = TOP_STATES_DATA.filter(s =>
    s.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.cities.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())) ||
    s.topColleges.some(col => col.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredJobs = HIGH_INTENT_JOB_HUBS.filter(j =>
    j.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.roles.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <Helmet>
        <title>All India Employment, College & Career Directory | TalentXcel Ecosystem</title>
        <meta name="description" content="Official high-density index of 12,400+ career hubs, verified job centers, 10,250 higher education dossiers, salary guides, and ATS tools across TalentXcel." />
        <link rel="canonical" href="https://talentxcel.in/directory" />
        <meta property="og:title" content="All India Employment, College & Career Directory | TalentXcel" />
        <meta property="og:description" content="Explore verified jobs, colleges, and salary benchmarks across India." />
        <meta property="og:url" content="https://talentxcel.in/directory" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <header className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white py-14 px-4 border-b border-slate-800">
          <div className="container mx-auto max-w-6xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/40">
                12,431+ Verified Index Targets &bull; Subdomain Ecosystem
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Crawl Depth: ≤ 2 Clicks from Apex Root
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
              TalentXcel National Career &amp; Education Directory
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
              Explore verified job centers, salary benchmarks, and 10,250+ higher education institutions categorized by State, Region, and Specialization.
            </p>

            {/* Live Filter Bar */}
            <div className="max-w-xl relative pt-2">
              <Search className="w-5 h-5 absolute left-3 top-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by city (e.g. Varanasi, Pune), state, college, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-400 shadow-inner outline-none transition-colors"
              />
            </div>
          </div>
        </header>

        <main className="container mx-auto max-w-6xl px-4 py-12 space-y-12">
          {/* Section 1: Verified Regional Job Hubs */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-black text-foreground">Verified Local Job Hubs &amp; Fresher Openings</h2>
              </div>
              <Link to="/jobs" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                View all jobs &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredJobs.map(hub => (
                <div key={hub.city} className="p-4 rounded-xl border bg-card hover:border-blue-500/60 transition-all shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Link to={hub.path} className="text-base font-bold text-foreground hover:text-blue-600 transition-colors">
                        Jobs in {hub.city}
                      </Link>
                      <span className="text-[10px] font-mono bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground block mb-2">{hub.category}</span>
                    <div className="space-y-1 text-xs text-slate-500">
                      {hub.roles.map(r => (
                        <div key={r} className="truncate">• {r} in {hub.city}</div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-3 mt-3 border-t">
                    <Link to={hub.path} className="text-xs font-bold text-blue-600 hover:underline flex items-center justify-between">
                      <span>Explore Openings</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: 10,250 Higher Education Institutions by State */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-emerald-600" />
                <h2 className="text-2xl font-black text-foreground">10,250+ College Dossiers &amp; Placement Statistics</h2>
              </div>
              <a href="https://colleges.talentxcel.in/colleges" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                Browse College Engine &rarr;
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredStates.map(st => (
                <div key={st.state} className="p-5 rounded-2xl border bg-card shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span>{st.state}</span>
                    </h3>
                    <span className="text-xs text-muted-foreground font-mono">
                      {st.cities.join(', ')}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                      Top Verified Institutions:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {st.topColleges.map(c => (
                        <a
                          key={c.slug}
                          href={`https://colleges.talentxcel.in/colleges/${c.slug}`}
                          className="p-2 rounded-lg bg-muted/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 border border-transparent hover:border-emerald-500/30 transition-all truncate block font-medium"
                        >
                          {c.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Salary Benchmark Guides */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-black text-foreground">2026 Salary &amp; Compensation Benchmarks</h2>
              </div>
              <a href="https://salary.talentxcel.in/salary" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                Open Salary Studio &rarr;
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {POPULAR_SALARY_BENCHMARKS.map(sal => (
                <a
                  key={sal.role}
                  href={sal.path}
                  className="p-4 rounded-xl border bg-card hover:border-indigo-500/60 transition-all shadow-sm block space-y-1"
                >
                  <span className="text-xs text-muted-foreground font-mono">Benchmark</span>
                  <h4 className="text-sm font-bold text-foreground">{sal.role}</h4>
                  <div className="text-base font-extrabold text-indigo-600 font-mono">{sal.avg} Avg</div>
                </a>
              ))}
            </div>
          </section>

          {/* Section 4: Public Open-Data Research Studies & Datasets */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl font-black text-foreground">Open-Data Research Studies &amp; Benchmark Reports</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <a
                href="/benchmarks/india-tech-salary-report-2026"
                className="p-6 rounded-2xl border bg-gradient-to-br from-blue-500/5 via-card to-indigo-500/5 hover:border-blue-500/50 transition-all shadow-sm block space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full">
                    Dataset Search Indexed
                  </span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground">India Tech Salary Report 2026</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Comprehensive compensation benchmarks across 25+ software engineering, AI, DevOps, and product roles in Bangalore, Delhi NCR, Hyderabad, Pune, and Tier-2 hubs. Includes CSV export and BibTeX citation.
                </p>
                <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                  Explore Full Benchmark Study &rarr;
                </span>
              </a>

              <a
                href="/benchmarks/tier-2-city-jobs-index-2026"
                className="p-6 rounded-2xl border bg-gradient-to-br from-emerald-500/5 via-card to-teal-500/5 hover:border-emerald-500/50 transition-all shadow-sm block space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                    Open Access Research
                  </span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Tier-2 City Jobs Growth Index 2026</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  In-depth analysis of IT and corporate decentralization across emerging centers like Indore, Varanasi, Jaipur, Coimbatore, and Kochi. Raw index data and citable schema.
                </p>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  Explore Tier-2 Index &rarr;
                </span>
              </a>
            </div>
          </section>
        </main>

        {/* Global Crawlable Subdomain Mesh Footer */}
        <SubdomainMeshFooter />
      </div>
    </>
  );
};

export default DirectoryHubPage;
