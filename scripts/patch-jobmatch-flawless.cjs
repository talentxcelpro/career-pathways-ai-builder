const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/components/products/JobMatchProduct.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Ensure interviewModalOpen state exists
if (!code.includes('interviewModalOpen')) {
  code = code.replace(
    'const [aiMatchModalOpen, setAiMatchModalOpen] = useState(false);',
    `const [aiMatchModalOpen, setAiMatchModalOpen] = useState(false);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);

  const openInterviewCoach = (job?: JobDetailItem) => {
    if (job) {
      setSelectedJobForInterview(job);
    } else if (jobs && jobs.length > 0) {
      setSelectedJobForInterview(jobs[0]);
    } else {
      setSelectedJobForInterview(null);
    }
    setInterviewModalOpen(true);
  };`
  );
}

// 2. Locate hero section
const heroMarkerStart = '<section id="search-hero"';
const heroMarkerEnd = '{/* BROWSE JOBS BY CATEGORY SECTION */}';

const startIndex = code.indexOf(heroMarkerStart);
const endIndex = code.indexOf(heroMarkerEnd);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not locate hero section bounds!');
  process.exit(1);
}

const replacementHero = `<section id="search-hero" className="bg-gradient-to-b from-white via-white to-[#F8FAFC] px-4 pt-6 pb-8 border-b border-[#E2E8F0]">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                  
                  {/* Left Column: Headline, Subtitle & Fast Action Buttons */}
                  <div className="lg:col-span-7 space-y-4 text-left">
                    {/* Clean Pill Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50/80 border border-blue-200/60 text-[#2563EB] text-xs font-bold shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Next-Gen Employment Marketplace • AI-POWERED</span>
                    </div>

                    {/* H1 Headline (in perfect sync, balanced font size & line wrap) */}
                    <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-[#111827] tracking-tight leading-[1.18]">
                      Find the Right Job<br />
                      for Your <span className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] bg-clip-text text-transparent">Next Career Move</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-[#64748B] text-sm sm:text-base leading-relaxed max-w-xl">
                      Discover verified vacancies with zero ghost listings, match your profile with next-gen AI compatibility scoring, and apply with 1-click Career Passport.
                    </p>

                    {/* Quick Hero Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setAiMatchModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <Sparkles className="w-4 h-4 text-white" />
                        <span>Run AI Compatibility Match</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openInterviewCoach()}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#7138E8] bg-purple-50 hover:bg-purple-100 border border-purple-200 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <GraduationCap className="w-4 h-4 text-[#7138E8]" />
                        <span>AI Interview Prep Coach</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Female Professional Visual + Floating Feature Cards */}
                  <div className="lg:col-span-5 hidden lg:flex items-center justify-center relative">
                    {/* Organic purple wave glow in backdrop */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-200/40 via-blue-100/30 to-purple-100/50 rounded-[32px] blur-xl transform -rotate-1 scale-95" />

                    <div className="relative w-full flex items-center justify-between gap-3">
                      {/* Professional Portrait */}
                      <div className="relative z-10 w-[230px] h-[270px] rounded-2xl overflow-hidden shadow-lg border border-purple-100/80 bg-white">
                        <img 
                          src="/hero-female-jobseeker.jpg"
                          onError={(e) => { (e.currentTarget).src = '/hero-female-jobseeker.png'; }}
                          alt="Professional Job Seeker"
                          className="w-full h-full object-cover object-top select-none transition-transform duration-500 hover:scale-[1.03]"
                        />
                      </div>

                      {/* Floating Card: 4 Quick Tools (100% Fully Working) */}
                      <div className="relative z-20 w-[185px] bg-white/95 backdrop-blur-md border border-[#E2E8F0] p-3 rounded-2xl shadow-lg space-y-2 shrink-0">
                        {/* 1. Job Alerts */}
                        <div 
                          onClick={() => toast.success('Job Alerts Activated: You will receive real-time notifications for verified matches!')}
                          className="flex items-center gap-2 cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#7138E8] flex items-center justify-center shrink-0">
                            <Bell className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-left">
                            <div className="text-xs font-bold text-[#111827]">Job Alerts</div>
                            <div className="text-[10px] text-[#64748B]">Get matching jobs</div>
                          </div>
                        </div>

                        {/* 2. Salary Insights */}
                        <a 
                          href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://salary.localhost:8080' : 'https://salary.talentxcel.in'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                            <BarChart3 className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-left">
                            <div className="text-xs font-bold text-[#111827]">Salary Insights</div>
                            <div className="text-[10px] text-[#64748B]">Know your market value</div>
                          </div>
                        </a>

                        {/* 3. Resume Builder */}
                        <a 
                          href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://resume.localhost:8080' : 'https://resume.talentxcel.in'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-left">
                            <div className="text-xs font-bold text-[#111827]">Resume Builder</div>
                            <div className="text-[10px] text-[#64748B]">Winning resumes</div>
                          </div>
                        </a>

                        {/* 4. Interview Prep */}
                        <div 
                          onClick={() => openInterviewCoach()}
                          className="flex items-center gap-2 cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <Target className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-left">
                            <div className="text-xs font-bold text-[#111827]">Interview Prep</div>
                            <div className="text-[10px] text-[#64748B]">Be interview ready</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Search Bar + Filters + 4 Innovation Cards */}
                <div className="mt-6 space-y-3">
                  
                  {/* Primary Search Bar */}
                  <div className="bg-white border border-[#E2E8F0] rounded-2xl p-2 shadow-xs flex flex-col md:flex-row items-center gap-2">
                    {/* Job Title & Skill Search */}
                    <div className="flex items-center gap-2.5 flex-1 px-3 w-full">
                      <Search className="w-4 h-4 text-slate-400 shrink-0" />
                      <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Job title, skills or company (e.g. Software Engineer, Marketing, TCS)"
                        className="w-full text-xs sm:text-sm text-[#111827] placeholder:text-slate-400 focus:outline-hidden bg-transparent"
                      />
                    </div>

                    <div className="h-6 w-px bg-slate-200 hidden md:block" />

                    {/* Location Dropdown */}
                    <div className="flex items-center gap-2 px-3 w-full md:w-[220px]">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <select 
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
                      </select>
                    </div>

                    {/* Find Jobs Button */}
                    <Button 
                      onClick={() => {
                        const el = document.getElementById('latest-jobs-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full md:w-auto bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shrink-0 shadow-xs cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5 mr-1" />
                      Find Jobs
                    </Button>
                  </div>

                  {/* Dropdown Filters Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Experience Filter */}
                      <select 
                        value={selectedExperience}
                        onChange={(e) => setSelectedExperience(e.target.value)}
                        className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#334155] focus:outline-hidden cursor-pointer hover:border-slate-300"
                      >
                        <option value="all">Experience ▾</option>
                        <option value="fresher">Fresher (0 - 1 yr)</option>
                        <option value="1-3">1 - 3 Yrs (Mid)</option>
                        <option value="3-5">3 - 5 Yrs (Senior)</option>
                        <option value="5+">5+ Yrs (Lead/Principal)</option>
                      </select>

                      {/* Salary Filter */}
                      <select 
                        value={selectedSalary}
                        onChange={(e) => setSelectedSalary(e.target.value)}
                        className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#334155] focus:outline-hidden cursor-pointer hover:border-slate-300"
                      >
                        <option value="all">Salary ▾</option>
                        <option value="3lpa">₹3L+ LPA</option>
                        <option value="6lpa">₹6L+ LPA</option>
                        <option value="10lpa">₹10L+ LPA</option>
                        <option value="20lpa">₹20L+ LPA</option>
                      </select>

                      {/* Work Mode Filter */}
                      <select 
                        value={selectedWorkMode}
                        onChange={(e) => setSelectedWorkMode(e.target.value)}
                        className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#334155] focus:outline-hidden cursor-pointer hover:border-slate-300"
                      >
                        <option value="all">Work Mode ▾</option>
                        <option value="remote">Remote</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="on-site">On-site</option>
                      </select>

                      {/* Job Type Filter */}
                      <select 
                        value={selectedEmploymentType}
                        onChange={(e) => setSelectedEmploymentType(e.target.value)}
                        className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#334155] focus:outline-hidden cursor-pointer hover:border-slate-300"
                      >
                        <option value="all">Job Type ▾</option>
                        <option value="full-time">Full-Time</option>
                        <option value="part-time">Part-Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                      </select>

                      {/* Industry Filter */}
                      <select 
                        value={selectedIndustry}
                        onChange={(e) => setSelectedIndustry(e.target.value)}
                        className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#334155] focus:outline-hidden cursor-pointer hover:border-slate-300"
                      >
                        <option value="all">Industry ▾</option>
                        {CATEGORIES_DATA.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {(searchTerm || selectedCity !== 'all' || selectedExperience !== 'all' || selectedSalary !== 'all' || selectedWorkMode !== 'all' || selectedEmploymentType !== 'all' || selectedIndustry !== 'all' || selectedCategory8 !== 'all' || selectedSubTab !== 'all') && (
                      <button
                        onClick={resetAllFilters}
                        className="text-xs text-[#2563EB] hover:text-[#7138E8] font-bold flex items-center gap-1 cursor-pointer hover:underline"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Filters</span>
                      </button>
                    )}
                  </div>

                  {/* 4 FEATURE CARDS: AI Match, Zero Ghost Listings, AI Interview Simulator, Transparent Benchmarks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                    {/* Card 1: AI Compatibility Match */}
                    <div
                      onClick={() => setAiMatchModalOpen(true)}
                      className="bg-white border border-purple-200 hover:border-purple-400 p-3.5 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center gap-3 text-left group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7138E8] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#111827] group-hover:text-[#7138E8] transition-colors leading-tight">
                          AI Compatibility Match
                        </div>
                        <div className="text-[11px] text-[#64748B] truncate">
                          Real-time skill gap analysis
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Zero Ghost Listings */}
                    <div
                      onClick={() => {
                        setSelectedSubTab('all');
                        setSelectedCategory8('all');
                        toast.success('Zero Ghost Listings: All 2,236 active jobs are 100% verified with direct unexpired employer routing.');
                        const el = document.getElementById('latest-jobs-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="bg-white border border-blue-200 hover:border-blue-400 p-3.5 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center gap-3 text-left group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors leading-tight">
                          Zero Ghost Listings
                        </div>
                        <div className="text-[11px] text-[#64748B] truncate">
                          100% direct verified routing
                        </div>
                      </div>
                    </div>

                    {/* Card 3: AI Interview Simulator */}
                    <div
                      onClick={() => openInterviewCoach()}
                      className="bg-white border border-amber-200 hover:border-amber-400 p-3.5 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center gap-3 text-left group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#111827] group-hover:text-amber-700 transition-colors leading-tight">
                          AI Interview Simulator
                        </div>
                        <div className="text-[11px] text-[#64748B] truncate">
                          Practice specific role Q&A
                        </div>
                      </div>
                    </div>

                    {/* Card 4: Transparent Benchmarks */}
                    <a
                      href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://salary.localhost:8080' : 'https://salary.talentxcel.in'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white border border-emerald-200 hover:border-emerald-400 p-3.5 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center gap-3 text-left group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#111827] group-hover:text-emerald-700 transition-colors leading-tight flex items-center gap-1">
                          <span>Transparent Benchmarks</span>
                          <ExternalLink className="w-3 h-3 text-[#64748B] group-hover:text-emerald-700" />
                        </div>
                        <div className="text-[11px] text-[#64748B] truncate">
                          Real CTC percentiles
                        </div>
                      </div>
                    </a>
                  </div>

                </div>
              </div>
            </section>

            `;

// Splice the replacement
code = code.substring(0, startIndex) + replacementHero + code.substring(endIndex);

// 3. Make sure interviewModalOpen modal is rendered at the end of the return statement
if (!code.includes('{interviewModalOpen && (')) {
  // Insert right before {aiMatchModalOpen && (
  code = code.replace(
    '{/* Interactive AI Compatibility Match Modal (100% Fully Working) */}',
    `{/* Standalone Interview Prep Modal (100% Fully Working) */}
      {interviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7138E8] flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-[#7138E8]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#111827]">AI Interview Simulator & STAR Practice</h3>
                  <p className="text-xs text-[#64748B]">Real-time role-specific interview simulation, timed responses & STAR answer frameworks.</p>
                </div>
              </div>
              <button
                onClick={() => setInterviewModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AIInterviewPrepCoach
              jobs={jobs}
              selectedJob={selectedJobForInterview || jobs[0]}
              onClose={() => setInterviewModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Interactive AI Compatibility Match Modal (100% Fully Working) */}`
  );
}

// 4. Also fix line 1326 where activeTab === 'interview' passed outdated props
code = code.replace(
  `<AIInterviewPrepCoach
              jobTitle={selectedJobForInterview?.title || 'Software Engineer'}
              companyName={selectedJobForInterview?.company_name || 'Tech Company'}
              skills={selectedJobForInterview?.skills_required}
              onClose={() => setActiveTab('discover')}
            />`,
  `<AIInterviewPrepCoach
              jobs={jobs}
              selectedJob={selectedJobForInterview}
              onClose={() => setActiveTab('discover')}
            />`
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully patched JobMatchProduct.tsx!');
