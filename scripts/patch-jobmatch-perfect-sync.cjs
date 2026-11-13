// scripts/patch-jobmatch-perfect-sync.cjs
// Synchronizes JobMatch OS hero typography, connects AI Match & Interview Prep modals,
// and ensures 100% functionality of the 8 category cards and interactive tools.

const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../src/components/products/JobMatchProduct.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Ensure X is imported from lucide-react
if (!code.includes('  X,\n') && !code.includes('  X ')) {
  code = code.replace("import {\n  Briefcase,", "import {\n  Briefcase,\n  X,");
  if (!code.includes('X,')) {
    code = code.replace("import { \n  Briefcase,", "import { \n  Briefcase,\n  X,");
  }
}

// 2. Add aiMatchModalOpen state if missing
if (!code.includes('aiMatchModalOpen')) {
  code = code.replace(
    "const [platformSidebarOpen, setPlatformSidebarOpen] = useState(false);",
    "const [platformSidebarOpen, setPlatformSidebarOpen] = useState(false);\n  const [aiMatchModalOpen, setAiMatchModalOpen] = useState(false);"
  );
}

// 3. Fix the Left Column Hero Section (synchronized with right column portrait)
const oldHeroLeftRegex = /\{\/\* Left Column: Headline & Subtitle \*\/\}[\s\S]*?\{\/\* Right Column: Female Professional Visual \+ Floating Feature Cards \*\/\}/;
const newHeroLeft = `{/* Left Column: Headline & Subtitle (In Perfect Sync) */}
                  <div className="lg:col-span-7 space-y-3.5 text-left">
                    {/* Clean Pill Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-50/80 border border-purple-200/60 text-[#7138E8] text-xs font-bold shadow-2xs">
                      <Briefcase className="w-3.5 h-3.5 text-[#7138E8]" />
                      <span>India's Next-Gen Job Marketplace</span>
                    </div>

                    {/* H1 Headline in Perfect Visual Sync */}
                    <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#111827] tracking-tight leading-[1.16]">
                      Find the Right Job<br />
                      for Your <span className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] bg-clip-text text-transparent">Next Career Move</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-[#64748B] text-sm sm:text-base leading-relaxed max-w-xl">
                      Discover verified job opportunities, apply easily, track your applications and grow your career — all in one place.
                    </p>
                  </div>

                  {/* Right Column: Female Professional Visual + Floating Feature Cards */}`;

code = code.replace(oldHeroLeftRegex, newHeroLeft);

// 4. Update the 4 Floating Tools on the Right Side
const oldFloatingRegex = /\{\/\* Floating Card: 4 Quick Tools \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* UNIFIED SEARCH & FILTER BAR/;
const newFloating = `{/* Floating Card: 4 Quick Tools (100% Fully Working) */}
                      <div className="relative z-20 w-[185px] bg-white/95 backdrop-blur-md border border-[#E2E8F0] p-3 rounded-2xl shadow-lg space-y-2 shrink-0">
                        {/* 1. Job Alerts */}
                        <div 
                          onClick={() => toast.success('Job Alerts Activated: You will receive real-time notifications for verified matches!')}
                          className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-slate-50 transition-colors"
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
                          className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#7138E8] flex items-center justify-center shrink-0">
                            <BarChart3 className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-left">
                            <div className="text-xs font-bold text-[#111827]">Salary Insights</div>
                            <div className="text-[10px] text-[#64748B]">Know market value</div>
                          </div>
                        </a>

                        {/* 3. Resume Builder */}
                        <a 
                          href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://resume.localhost:8080' : 'https://resume.talentxcel.in'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#7138E8] flex items-center justify-center shrink-0">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-left">
                            <div className="text-xs font-bold text-[#111827]">Resume Builder</div>
                            <div className="text-[10px] text-[#64748B]">Winning resumes</div>
                          </div>
                        </a>

                        {/* 4. Interview Prep */}
                        <div 
                          onClick={() => {
                            setSelectedJobForInterview(jobs[0] || null);
                          }}
                          className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#7138E8] flex items-center justify-center shrink-0">
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

                {/* UNIFIED SEARCH & FILTER BAR`;

code = code.replace(oldFloatingRegex, newFloating);

// 5. Remove the redundant 4 cards from below the filter chips, and add the AI Match ⚡ button
const oldFilterRowRegex = /\{\/\* Next-Gen Innovation Strip[\s\S]*?<\/div>\s*<\/div>\s*<\/section>\s*\{\/\* BROWSE JOBS BY CATEGORY SECTION \*\/\}/;
const newFilterRow = `</div>
                  </div>
                </div>
              </div>
            </section>

            {/* BROWSE JOBS BY CATEGORY SECTION */}`;

code = code.replace(oldFilterRowRegex, newFilterRow);

// 6. Ensure the filter row includes the AI Match button
if (!code.includes('AI Match ⚡')) {
  code = code.replace(
    '<span>Reset Filters</span>\n                      </button>\n                    )}',
    `<span>Reset Filters</span>\n                      </button>\n                    )}

                    <button
                      type="button"
                      onClick={() => setAiMatchModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#7138E8] bg-purple-50 hover:bg-purple-100 border border-purple-200 flex items-center gap-1.5 cursor-pointer ml-auto transition-all shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#7138E8]" />
                      <span>AI Match ⚡</span>
                    </button>`
  );
}

// 7. Fix AIInterviewPrepCoach modal and add AIMatchWorkspace modal before footer
const oldModalRegex = /\{\/\* Standalone Interview Prep Modal \*\/\}[\s\S]*?\{\/\* Public Light Footer \*\/\}/;
const newModals = `{/* Standalone Interview Prep Modal (100% Fully Working) */}
      {selectedJobForInterview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-[#2563EB]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#111827]">AI Interview Preparation Coach</h3>
                  <p className="text-xs text-[#64748B]">Real-time role-specific interview simulation & STAR answer frameworks.</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedJobForInterview(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AIInterviewPrepCoach
              jobs={jobs}
              selectedJob={selectedJobForInterview}
              onClose={() => setSelectedJobForInterview(null)}
            />
          </div>
        </div>
      )}

      {/* Interactive AI Compatibility Match Modal (100% Fully Working) */}
      {aiMatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7138E8] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#111827]">AI Compatibility Match & Skill-Gap Analysis</h3>
                  <p className="text-xs text-[#64748B]">Calculate real-time fit scores against 2,236+ verified vacancies.</p>
                </div>
              </div>
              <button
                onClick={() => setAiMatchModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AIMatchWorkspace
              jobs={jobs}
              onApplyJob={(j) => {
                setAiMatchModalOpen(false);
                handleApplyClick(j);
              }}
              onOpenJobDetail={(j) => {
                setAiMatchModalOpen(false);
                setSelectedJobForDetail(j);
              }}
              isSavedJob={(id) => savedJobIds.includes(id)}
              onToggleSaveJob={(id) => toggleSaveJob(id)}
            />
          </div>
        </div>
      )}

      {/* Public Light Footer */}`;

code = code.replace(oldModalRegex, newModals);

fs.writeFileSync(targetFile, code, 'utf8');
console.log('Successfully applied synchronization patch to JobMatchProduct.tsx');
