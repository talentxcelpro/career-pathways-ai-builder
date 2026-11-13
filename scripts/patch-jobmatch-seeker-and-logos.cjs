const fs = require('fs');
const file = 'src/components/products/JobMatchProduct.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Target Hero Section
const heroTarget = `            {/* Hero Section */}
            <section id="search-hero" className="bg-gradient-to-b from-white via-white to-[#F4F7FC] border-b border-[#E2E8F0] px-4 pt-10 pb-12">
              <div className="max-w-5xl mx-auto text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>1-Click Direct Apply with Verified Career Passport</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-[#111827] tracking-tight leading-tight">
                  Find Your Next <span className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] bg-clip-text text-transparent">Verified Job Match</span>
                </h1>

                <p className="text-[#64748B] text-sm sm:text-base max-w-2xl mx-auto">
                  Zero ghost listings. Every vacancy is verified with authentic application links, transparent compensation benchmarks, and direct employer routing.
                </p>

                {/* Premium Search Container */}
                <div className="max-w-3xl mx-auto bg-white border border-[#E2E8F0] rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row gap-2 shadow-lg shadow-blue-900/5 mt-4">
                  <div className="flex-1 flex items-center gap-2.5 px-3 py-1 bg-[#F4F7FC] rounded-xl border border-[#E2E8F0] focus-within:border-[#2563EB] transition-colors">
                    <Search className="w-4 h-4 text-[#64748B] shrink-0" />
                    <Input 
                      type="text" 
                      placeholder="Job title, skill (e.g. React, Marketing, SRE, Trainee)..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-0 bg-transparent text-sm focus-visible:ring-0 text-[#111827] placeholder:text-[#64748B] p-0 h-9"
                    />
                  </div>

                  <div className="w-full sm:w-52 flex items-center gap-2 px-3 py-1 bg-[#F4F7FC] rounded-xl border border-[#E2E8F0] focus-within:border-[#2563EB] transition-colors">
                    <MapPin className="w-4 h-4 text-[#64748B] shrink-0" />
                    <select 
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full bg-transparent text-xs font-medium text-[#111827] border-0 focus:outline-hidden cursor-pointer h-9"
                    >
                      <option value="all">All Locations (India & Global)</option>
                      <option value="bangalore">Bengaluru / Bangalore</option>
                      <option value="hyderabad">Hyderabad</option>
                      <option value="pune">Pune</option>
                      <option value="noida">Noida / Delhi-NCR</option>
                      <option value="mumbai">Mumbai</option>
                      <option value="chennai">Chennai</option>
                      <option value="kolkata">Kolkata</option>
                      <option value="remote">Remote / Work from Home</option>
                    </select>
                  </div>

                  <Button 
                    onClick={() => {}}
                    className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs px-7 py-3 rounded-xl shadow-xs transition-all shrink-0 h-10"
                  >
                    Find Jobs
                  </Button>
                </div>

                {/* Quick Micro-Filters Row */}
                <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <select 
                      value={selectedSalary}
                      onChange={(e) => setSelectedSalary(e.target.value)}
                      className="bg-white border border-[#E2E8F0] rounded-xl px-2.5 py-1 text-xs font-semibold text-[#111827] focus:outline-hidden cursor-pointer"
                    >
                      <option value="all">Any Salary</option>
                      <option value="3lpa">₹3L+ LPA</option>
                      <option value="6lpa">₹6L+ LPA</option>
                      <option value="10lpa">₹10L+ LPA</option>
                      <option value="20lpa">₹20L+ LPA</option>
                    </select>

                    <select 
                      value={selectedWorkMode}
                      onChange={(e) => setSelectedWorkMode(e.target.value)}
                      className="bg-white border border-[#E2E8F0] rounded-xl px-2.5 py-1 text-xs font-semibold text-[#111827] focus:outline-hidden cursor-pointer"
                    >
                      <option value="all">Any Work Mode</option>
                      <option value="remote">Remote Only</option>
                      <option value="hybrid">Hybrid</option>
                    </select>

                    <select 
                      value={selectedExperience}
                      onChange={(e) => setSelectedExperience(e.target.value)}
                      className="bg-white border border-[#E2E8F0] rounded-xl px-2.5 py-1 text-xs font-semibold text-[#111827] focus:outline-hidden cursor-pointer"
                    >
                      <option value="all">Any Experience</option>
                      <option value="fresher">Fresher (0 - 1 Yrs)</option>
                      <option value="1-3">1 - 3 Yrs (Mid)</option>
                      <option value="3-5">3 - 5 Yrs (Senior)</option>
                      <option value="5+">5+ Yrs (Lead/Principal)</option>
                    </select>

                    <select 
                      value={selectedEmploymentType}
                      onChange={(e) => setSelectedEmploymentType(e.target.value)}
                      className="bg-white border border-[#E2E8F0] rounded-xl px-2.5 py-1 text-xs font-semibold text-[#111827] focus:outline-hidden cursor-pointer"
                    >
                      <option value="all">All Job Types</option>
                      <option value="full-time">Full-Time</option>
                      <option value="part-time">Part-Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>

                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-white border border-[#E2E8F0] rounded-xl px-2.5 py-1 text-xs font-semibold text-[#2563EB] focus:outline-hidden cursor-pointer"
                    >
                      <option value="latest">Sort: Latest</option>
                      <option value="salary_high">Sort: Highest CTC</option>
                      <option value="experience">Sort: Min Exp</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setActiveTab('saved')}
                      className="px-3 py-1 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 bg-white text-[#64748B] border-[#E2E8F0] hover:text-[#111827]"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Saved Vacancies ({savedJobIds.length})</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('match')}
                    className="text-xs text-[#2563EB] hover:text-[#7138E8] font-bold flex items-center gap-1 hover:underline ml-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run AI Profile Compatibility Match →</span>
                  </button>
                </div>
              </div>
            </section>`;

const heroReplacement = `            {/* Hero Section with Job Seeker Visual (Founder Directive) */}
            <section id="search-hero" className="bg-gradient-to-b from-white via-white to-[#F4F7FC] border-b border-[#E2E8F0] px-4 pt-8 pb-12">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                  
                  {/* Left Column: Value Proposition & Premium Search */}
                  <div className="lg:col-span-7 space-y-4 text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>1-Click Direct Apply with Verified Career Passport</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111827] tracking-tight leading-[1.12]">
                      Find Your Next <br />
                      <span className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] bg-clip-text text-transparent">
                        Verified Job Match
                      </span>
                    </h1>

                    <p className="text-[#64748B] text-sm sm:text-base leading-relaxed max-w-xl">
                      Zero ghost listings. Every vacancy is verified with authentic application links, transparent compensation benchmarks, and direct employer routing.
                    </p>

                    {/* Premium Search Container */}
                    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row gap-2 shadow-lg shadow-blue-900/5 mt-2">
                      <div className="flex-1 flex items-center gap-2.5 px-3 py-1 bg-[#F4F7FC] rounded-xl border border-[#E2E8F0] focus-within:border-[#2563EB] transition-colors">
                        <Search className="w-4 h-4 text-[#64748B] shrink-0" />
                        <Input 
                          type="text" 
                          placeholder="Job title, skill (e.g. React, Marketing, SRE, Trainee)..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="border-0 bg-transparent text-sm focus-visible:ring-0 text-[#111827] placeholder:text-[#64748B] p-0 h-9"
                        />
                      </div>

                      <div className="w-full sm:w-52 flex items-center gap-2 px-3 py-1 bg-[#F4F7FC] rounded-xl border border-[#E2E8F0] focus-within:border-[#2563EB] transition-colors">
                        <MapPin className="w-4 h-4 text-[#64748B] shrink-0" />
                        <select 
                          value={selectedCity}
                          onChange={(e) => setSelectedCity(e.target.value)}
                          className="w-full bg-transparent text-xs font-medium text-[#111827] border-0 focus:outline-hidden cursor-pointer h-9"
                        >
                          <option value="all">All Locations (India & Global)</option>
                          <option value="bangalore">Bengaluru / Bangalore</option>
                          <option value="hyderabad">Hyderabad</option>
                          <option value="pune">Pune</option>
                          <option value="noida">Noida / Delhi-NCR</option>
                          <option value="mumbai">Mumbai</option>
                          <option value="chennai">Chennai</option>
                          <option value="kolkata">Kolkata</option>
                          <option value="remote">Remote / Work from Home</option>
                        </select>
                      </div>

                      <Button 
                        onClick={() => {}}
                        className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs px-7 py-3 rounded-xl shadow-xs transition-all shrink-0 h-10 cursor-pointer"
                      >
                        Find Jobs
                      </Button>
                    </div>

                    {/* Quick Micro-Filters Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <select 
                          value={selectedSalary}
                          onChange={(e) => setSelectedSalary(e.target.value)}
                          className="bg-white border border-[#E2E8F0] rounded-xl px-2.5 py-1 text-xs font-semibold text-[#111827] focus:outline-hidden cursor-pointer"
                        >
                          <option value="all">Any Salary</option>
                          <option value="3lpa">₹3L+ LPA</option>
                          <option value="6lpa">₹6L+ LPA</option>
                          <option value="10lpa">₹10L+ LPA</option>
                          <option value="20lpa">₹20L+ LPA</option>
                        </select>

                        <select 
                          value={selectedWorkMode}
                          onChange={(e) => setSelectedWorkMode(e.target.value)}
                          className="bg-white border border-[#E2E8F0] rounded-xl px-2.5 py-1 text-xs font-semibold text-[#111827] focus:outline-hidden cursor-pointer"
                        >
                          <option value="all">Any Work Mode</option>
                          <option value="remote">Remote Only</option>
                          <option value="hybrid">Hybrid</option>
                        </select>

                        <select 
                          value={selectedExperience}
                          onChange={(e) => setSelectedExperience(e.target.value)}
                          className="bg-white border border-[#E2E8F0] rounded-xl px-2.5 py-1 text-xs font-semibold text-[#111827] focus:outline-hidden cursor-pointer"
                        >
                          <option value="all">Any Experience</option>
                          <option value="fresher">Fresher (0 - 1 Yrs)</option>
                          <option value="1-3">1 - 3 Yrs (Mid)</option>
                          <option value="3-5">3 - 5 Yrs (Senior)</option>
                          <option value="5+">5+ Yrs (Lead/Principal)</option>
                        </select>

                        <select 
                          value={selectedEmploymentType}
                          onChange={(e) => setSelectedEmploymentType(e.target.value)}
                          className="bg-white border border-[#E2E8F0] rounded-xl px-2.5 py-1 text-xs font-semibold text-[#111827] focus:outline-hidden cursor-pointer"
                        >
                          <option value="all">All Job Types</option>
                          <option value="full-time">Full-Time</option>
                          <option value="part-time">Part-Time</option>
                          <option value="contract">Contract</option>
                          <option value="internship">Internship</option>
                        </select>

                        <select 
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="bg-white border border-[#E2E8F0] rounded-xl px-2.5 py-1 text-xs font-semibold text-[#2563EB] focus:outline-hidden cursor-pointer"
                        >
                          <option value="latest">Sort: Latest</option>
                          <option value="salary_high">Sort: Highest CTC</option>
                          <option value="experience">Sort: Min Exp</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => setActiveTab('saved')}
                          className="px-3 py-1 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 bg-white text-[#64748B] border-[#E2E8F0] hover:text-[#111827] cursor-pointer"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>Saved Vacancies ({savedJobIds.length})</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTab('match')}
                        className="text-xs text-[#2563EB] hover:text-[#7138E8] font-bold flex items-center gap-1 hover:underline ml-auto cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Run AI Compatibility Match →</span>
                      </button>
                    </div>

                    {/* Live Verified Inventory Status Strip */}
                    <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-[#64748B] font-semibold border-t border-slate-100">
                      <span className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{totalCount.toLocaleString()}+ Active Vacancies</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5 text-[#2563EB]">
                        <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>297 Verified Employers</span>
                      </span>
                      <span>•</span>
                      <span className="text-slate-500">Pan-India & Remote</span>
                    </div>
                  </div>

                  {/* Right Column: Confident Job Seeker Hero Visual with Badges */}
                  <div className="lg:col-span-5 hidden lg:flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-[460px] rounded-3xl overflow-hidden shadow-xl border border-blue-100 bg-gradient-to-tr from-blue-50/50 via-white to-indigo-50/30 group">
                      <img 
                        src="/hero-character-jobseeker.jpg" 
                        onError={(e) => { (e.currentTarget).src = '/hero-character-full.webp'; }}
                        alt="TalentXcel Verified Job Seeker"
                        className="w-full h-[360px] object-cover object-top select-none transition-transform duration-500 group-hover:scale-[1.02]"
                        loading="eager"
                      />

                      {/* Floating Badge 1: Top Right */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md border border-white/80 p-2.5 rounded-2xl shadow-lg flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-black text-[#111827]">{totalCount.toLocaleString()}+ Verified</div>
                          <div className="text-[10px] text-emerald-600 font-bold">Active Openings</div>
                        </div>
                      </div>

                      {/* Floating Badge 2: Bottom Left with Logos */}
                      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md border border-white/80 p-2.5 rounded-2xl shadow-lg flex items-center gap-2.5">
                        <div className="flex -space-x-1.5">
                          <CompanyLogoAvatar companyName="Google" size="sm" className="border-2 border-white" />
                          <CompanyLogoAvatar companyName="TCS" size="sm" className="border-2 border-white" />
                          <CompanyLogoAvatar companyName="Infosys" size="sm" className="border-2 border-white" />
                          <CompanyLogoAvatar companyName="BHEL" size="sm" className="border-2 border-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-black text-[#111827]">297 Employers</div>
                          <div className="text-[10px] text-[#2563EB] font-bold">Hiring Now</div>
                        </div>
                      </div>

                      {/* Floating Badge 3: Bottom Right */}
                      <div className="absolute bottom-4 right-4 bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>Fast Apply</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>`;

if (!content.includes(heroTarget)) {
  console.error('heroTarget not found in JobMatchProduct.tsx');
  process.exit(1);
}

content = content.replace(heroTarget, heroReplacement);

// 2. Target Job Card to add CompanyLogoAvatar
const cardTarget = `                        <Card 
                          key={job.id}
                          className="bg-white border-[#E2E8F0] hover:border-[#2563EB] transition-all rounded-2xl p-5 shadow-xs hover:shadow-md text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                          onClick={() => setSelectedJobForDetail(job)}
                        >
                          <div className="space-y-2 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                {job.company_name}
                              </span>
                              <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px] font-bold">
                                Verified
                              </Badge>
                              {job.is_remote && (
                                <Badge variant="outline" className="text-purple-700 bg-purple-50 border-purple-200 text-[10px] font-bold">
                                  Remote
                                </Badge>
                              )}
                            </div>

                            <h3 className="font-bold text-base sm:text-lg text-[#111827] hover:text-[#2563EB] transition-colors leading-snug">
                              {job.title}
                            </h3>`;

const cardReplacement = `                        <Card 
                          key={job.id}
                          className="bg-white border-[#E2E8F0] hover:border-[#2563EB] transition-all rounded-2xl p-5 shadow-xs hover:shadow-md text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                          onClick={() => setSelectedJobForDetail(job)}
                        >
                          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                            <CompanyLogoAvatar companyName={job.company_name} size="lg" className="mt-0.5 shrink-0" />
                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                  {job.company_name}
                                </span>
                                <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px] font-bold">
                                  Verified
                                </Badge>
                                {job.is_remote && (
                                  <Badge variant="outline" className="text-purple-700 bg-purple-50 border-purple-200 text-[10px] font-bold">
                                    Remote
                                  </Badge>
                                )}
                              </div>

                              <h3 className="font-bold text-base sm:text-lg text-[#111827] hover:text-[#2563EB] transition-colors leading-snug">
                                {job.title}
                              </h3>`;

if (!content.includes(cardTarget)) {
  console.error('cardTarget not found in JobMatchProduct.tsx');
  process.exit(1);
}

content = content.replace(cardTarget, cardReplacement);

// 3. Add floating quick launcher and PlatformEcosystemSidebar before closing tag
if (!content.includes('PlatformEcosystemSidebar open={platformSidebarOpen}')) {
  const footerTarget = `      {/* Shared Global Product Footer */}
      <JobPortalFooter />`;

  const footerReplacement = `      {/* Floating Quick Launcher for All 12 Platforms */}
      <div className="fixed left-4 bottom-6 z-40 hidden sm:block">
        <button
          type="button"
          onClick={() => setPlatformSidebarOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-[#2563EB]/40 shadow-xl hover:shadow-2xl hover:scale-105 text-[#2563EB] text-xs font-black transition-all cursor-pointer group"
          title="Explore all 12 TalentXcel platforms"
        >
          <Compass className="w-4 h-4 text-[#2563EB] group-hover:rotate-90 transition-transform" />
          <span>Explore All 12 Platforms</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      </div>

      {/* Slide-Out 12 Platform Ecosystem Navigation Sidebar */}
      <PlatformEcosystemSidebar 
        open={platformSidebarOpen} 
        onOpenChange={setPlatformSidebarOpen} 
      />

      {/* Shared Global Product Footer */}
      <JobPortalFooter />`;

  content = content.replace(footerTarget, footerReplacement);
}

const tmpFile = 'src/components/products/JobMatchProduct.tmp.tsx';
fs.writeFileSync(tmpFile, content, 'utf8');
console.log('Successfully wrote JobMatchProduct.tmp.tsx');
