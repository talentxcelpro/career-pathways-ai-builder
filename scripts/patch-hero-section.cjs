const fs = require('fs');
const file = 'src/components/landing/AppleHeroSection.tsx';
const tmpFile = 'src/components/landing/AppleHeroSection.tmp.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `          {/* Right Column: Global Hero Graphic with Interactive Hotspot Cards */}
          <div className="lg:col-span-6 relative w-full flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[560px] max-h-[165px] sm:max-h-none rounded-2xl overflow-hidden shadow-xl border border-blue-100/90 dark:border-slate-800 bg-gradient-to-tr from-blue-50/50 to-indigo-50/30 dark:from-slate-900 dark:to-slate-800 group">
              <img 
                src="/hero-character-full.webp" 
                alt="TalentXcel Global Career Platform"
                className="w-full h-[165px] sm:h-auto object-cover object-top sm:object-center select-none transition-transform duration-500 group-hover:scale-[1.01]"
                loading="eager"
              />

              {/* 4 Interactive Desktop Hotspots mapped precisely to glass cards */}
              <Link 
                to="/jobs"
                title="Jobs Worldwide - Explore active openings across 50+ countries"
                className="hidden sm:block absolute left-[60%] top-[18%] w-[29%] h-[16%] rounded-xl transition-all duration-200 hover:ring-2 hover:ring-blue-400 hover:bg-blue-500/10 cursor-pointer"
                aria-label="Jobs Worldwide"
              />
              <Link 
                to="/recruiters"
                title="Top Recruiters - Connect with 1,000+ verified recruiters"
                className="hidden sm:block absolute left-[63.5%] top-[35%] w-[27.5%] h-[16%] rounded-xl transition-all duration-200 hover:ring-2 hover:ring-blue-400 hover:bg-blue-500/10 cursor-pointer"
                aria-label="Top Recruiters"
              />
              <Link 
                to="/career-map"
                title="Career Growth - Discover AI-driven learning and career progression"
                className="hidden sm:block absolute left-[67%] top-[52.5%] w-[25%] h-[16%] rounded-xl transition-all duration-200 hover:ring-2 hover:ring-purple-400 hover:bg-purple-500/10 cursor-pointer"
                aria-label="Career Growth"
              />
              <Link 
                to="/colleges"
                title="Verified Colleges & Degrees - Explore 2,000+ accredited institutions"
                className="hidden sm:block absolute left-[67%] top-[70%] w-[25%] h-[17%] rounded-xl transition-all duration-200 hover:ring-2 hover:ring-purple-400 hover:bg-purple-500/10 cursor-pointer"
                aria-label="Verified Colleges & Degrees"
              />
            </div>`;

const replacement = `          {/* Right Column: Global Hero Graphic with Interactive Hotspot Cards */}
          <div className="lg:col-span-6 relative w-full flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[560px] rounded-2xl overflow-hidden shadow-xl border border-blue-100/90 dark:border-slate-800 bg-gradient-to-tr from-blue-50/50 to-indigo-50/30 dark:from-slate-900 dark:to-slate-800 group">
              <img 
                src="/hero-character-jobseeker.jpg" 
                onError={(e) => { (e.currentTarget).src = '/hero-character-full.webp'; }}
                alt="TalentXcel Global Career Platform - Confident Job Seeker"
                className="w-full h-[190px] sm:h-[340px] md:h-[360px] object-cover object-top sm:object-center select-none transition-transform duration-500 group-hover:scale-[1.01]"
                loading="eager"
              />

              {/* 4 Interactive Desktop Glassmorphism Badges (Image 2 Reference) */}
              <div className="hidden sm:flex absolute right-3.5 top-1/2 -translate-y-1/2 flex-col gap-2 z-10 w-[175px]">
                <Link 
                  to="/jobs"
                  className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-white/70 dark:border-slate-700/70 p-2 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all flex items-center gap-2.5 group/card cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">Jobs Worldwide</div>
                    <div className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold truncate">2,230+ Active Roles</div>
                  </div>
                </Link>

                <Link 
                  to="/recruiters"
                  className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-white/70 dark:border-slate-700/70 p-2 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all flex items-center gap-2.5 group/card cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">Top Recruiters</div>
                    <div className="text-[9px] text-cyan-600 dark:text-cyan-400 font-semibold truncate">297 Companies</div>
                  </div>
                </Link>

                <Link 
                  to="/career-map"
                  className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-white/70 dark:border-slate-700/70 p-2 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all flex items-center gap-2.5 group/card cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">Career Growth</div>
                    <div className="text-[9px] text-purple-600 dark:text-purple-400 font-semibold truncate">AI Trajectories</div>
                  </div>
                </Link>

                <Link 
                  to="/colleges"
                  className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-white/70 dark:border-slate-700/70 p-2 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all flex items-center gap-2.5 group/card cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">Verified Colleges</div>
                    <div className="text-[9px] text-indigo-600 dark:text-indigo-400 font-semibold truncate">Accredited Degrees</div>
                  </div>
                </Link>
              </div>
            </div>`;

if (!content.includes(target)) {
  console.error('Target block not found!');
  process.exit(1);
}

content = content.replace(target, replacement);

if (!content.includes('<ExploreNavigationDrawer')) {
  content = content.replace('<TXCProductVideoModal', '<ExploreNavigationDrawer open={exploreDrawerOpen} onOpenChange={setExploreDrawerOpen} />\n      <TXCProductVideoModal');
}

fs.writeFileSync(tmpFile, content, 'utf8');
console.log('Wrote tmpFile successfully');
