// scripts/complete-career-pathfinder-multidim.cjs
const fs = require('fs');
const path = require('path');

const targetFilePath = path.join(__dirname, '../src/components/products/CareerPathfinderProduct.tsx');
let content = fs.readFileSync(targetFilePath, 'utf8');

// 1. Update activeProTab state type
content = content.replace(
  "const [activeProTab, setActiveProTab] = useState<'checklist' | 'interview' | 'ats_resume' | 'recruiter'>('checklist');",
  "const [activeProTab, setActiveProTab] = useState<'checklist' | 'interview' | 'templates' | 'ats_resume' | 'recruiter'>('checklist');"
);

// 2. Add Multi-Dimensional Filter Bar directly into the Navigator Section
// Search for the section title
const searchNavigatorTitle = `<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">`;

const multiDimFilterBar = `
            {/* Multi-Dimensional Filter Bar (Experience Level, Geography / Market & Quick Industries) */}
            <div className="bg-gradient-to-r from-slate-50 via-blue-50/20 to-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3.5">
              
              {/* Row 1: Seniority Experience & Location Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
                {/* Experience Level Selector */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-700 flex items-center gap-1 text-[11px] mr-1">
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    Experience Level:
                  </span>
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => {
                        setSelectedExperience(lvl.id);
                        setNavigatorMode('catalog');
                      }}
                      className={\`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer \${
                        selectedExperience === lvl.id
                          ? 'bg-[#2563EB] text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }\`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>

                {/* Location / Geography Tier Selector */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-700 flex items-center gap-1 text-[11px] mr-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Target Market:
                  </span>
                  {LOCATION_TIERS.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedLocationTier(loc.id)}
                      className={\`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer \${
                        selectedLocationTier === loc.id
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }\`}
                    >
                      {loc.badge}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: 16 Industry Sectors Filter Strip */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <span className="flex items-center gap-1">
                    <Filter className="w-3 h-3 text-purple-600" />
                    Filter by Industry Sector (16 Global Industries):
                  </span>
                  <span className="text-[#2563EB] font-bold">
                    {filteredTransitions.length} Pathways Available
                  </span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-semibold no-scrollbar">
                  {CAREER_INDUSTRIES.map((ind) => (
                    <button
                      key={ind}
                      onClick={() => {
                        setSelectedCategory(ind);
                        setNavigatorMode('catalog');
                      }}
                      className={\`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer \${
                        selectedCategory === ind
                          ? 'bg-[#2563EB] text-white font-bold shadow-2xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }\`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: Active Location Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1.5 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>Market CTC Benchmark: <strong className="text-slate-900">{activeLocationInfo.label}</strong> ({activeLocationInfo.cities})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-500">Regional Parity Index:</span>
                  <span className="font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {activeLocationInfo.multiplier}x Standard Benchmark
                  </span>
                </div>
              </div>
            </div>
`;

if (!content.includes('Experience Level:')) {
  content = content.replace(searchNavigatorTitle, multiDimFilterBar + '\n            ' + searchNavigatorTitle);
}

// 3. Update the KPI card values to use adjustedCurrentCtc and adjustedTargetCtc
content = content.replace(
  '₹{activeTransition.currentAvgCtcLakhs}L Avg CTC',
  '{activeLocationInfo.currencyPrefix}{adjustedCurrentCtc}{activeLocationInfo.currencySuffix}'
);
content = content.replace(
  '₹{activeTransition.targetAvgCtcLakhs}L Avg CTC',
  '{activeLocationInfo.currencyPrefix}{adjustedTargetCtc}{activeLocationInfo.currencySuffix}'
);

// 4. Update Dropdown Popover (Image 9) to show richer details and experience badge
const oldItemRender = `<div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 truncate">
                                    <span>{item.currentRole}</span>
                                    <span className="text-[#2563EB]">→</span>
                                    <span className="text-[#2563EB] truncate">{item.targetRole}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                    <span>{item.industryCategory}</span>
                                    <span>•</span>
                                    <span>{item.timeEstimateMonths} Months</span>
                                    <span>•</span>
                                    <span>₹{item.currentAvgCtcLakhs}L → ₹{item.targetAvgCtcLakhs}L CTC</span>
                                  </div>`;

const newItemRender = `<div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 truncate">
                                    <span>{item.currentRole}</span>
                                    <span className="text-[#2563EB]">→</span>
                                    <span className="text-[#2563EB] truncate">{item.targetRole}</span>
                                    {item.experienceLevel && (
                                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                                        {item.experienceLevel}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                    <span className="truncate">{item.industryCategory}</span>
                                    <span>•</span>
                                    <span>{item.timeEstimateMonths} Mo</span>
                                    <span>•</span>
                                    <span>₹{Math.round(item.currentAvgCtcLakhs * activeLocationInfo.multiplier * 10)/10}L → ₹{Math.round(item.targetAvgCtcLakhs * activeLocationInfo.multiplier * 10)/10}L CTC</span>
                                  </div>`;

content = content.replace(oldItemRender, newItemRender);

// 5. Add "Executive Templates & Working Documents" Tab in Pro Suite
const oldTabsStrip = `<button
                    onClick={() => setActiveProTab('ats_resume')}
                    className={\`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap \${
                      activeProTab === 'ats_resume' 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-300 hover:text-white bg-white/5'
                    }\`}
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    <span>ATS Resume Bullets & Keyword Matrix</span>
                  </button>`;

const newTabsStrip = `<button
                    onClick={() => setActiveProTab('templates')}
                    className={\`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap \${
                      activeProTab === 'templates' 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-300 hover:text-white bg-white/5'
                    }\`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Production Templates & Executive Models Kit</span>
                  </button>

                  <button
                    onClick={() => setActiveProTab('ats_resume')}
                    className={\`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap \${
                      activeProTab === 'ats_resume' 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-300 hover:text-white bg-white/5'
                    }\`}
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>ATS Resume Bullets & Keyword Matrix</span>
                  </button>`;

content = content.replace(oldTabsStrip, newTabsStrip);

// Add tab content for 'templates'
const oldTabInterviewEnd = `{/* Tab Content 3: ATS Resume Bullets & Keyword Matrix */}`;
const templatesTabContent = `{/* Tab Content: Production Templates & Working Documents Kit */}
                {activeProTab === 'templates' && (
                  <div className="pt-4 space-y-3 text-left">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Executive Deliverables & Production Templates Kit for {activeTransition.targetRole}:</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30 font-bold">
                        Verified Working Assets
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Template 1: Financial & Budget Model */}
                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                              <FileSpreadsheet className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-white">
                                {activeTransition.industryCategory.includes('HR')
                                  ? 'Annual Headcount & ESOP Pool Budget Model 2026'
                                  : (activeTransition.industryCategory.includes('Sales')
                                    ? 'Global B2B GTM Quota & Territory Capacity Model'
                                    : (activeTransition.industryCategory.includes('Finance') || activeTransition.industryCategory.includes('CA')
                                      ? '3-Statement LBO & EBITDA Sensitivity Model'
                                      : (activeTransition.industryCategory.includes('Supply')
                                        ? 'ARIMA Demand Forecasting & Safety Stock Workbook'
                                        : 'Operating Capex & System Capacity Model')))}
                              </h5>
                              <span className="text-[10px] text-slate-400">Microsoft Excel (.xlsx) • Dynamic formulas included</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Complete pre-configured analytical spreadsheet with variable input switches, automated sensitivity checks, and executive dashboard summary tabs.
                        </p>
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] text-emerald-400 font-semibold">Ready to Use</span>
                          <button
                            onClick={() => {
                              if (!isProUnlocked) {
                                setIsProModalOpen(true);
                              } else {
                                toast.success('Template downloaded! Ready for executive presentation.');
                              }
                            }}
                            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Model</span>
                          </button>
                        </div>
                      </div>

                      {/* Template 2: Executive Playbook & Framework */}
                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-white">
                                {activeTransition.industryCategory.includes('HR')
                                  ? '9-Box Performance Grid & Succession Policy'
                                  : (activeTransition.industryCategory.includes('Sales')
                                    ? 'Enterprise MEDDPICC Deal Qualification Playbook'
                                    : (activeTransition.industryCategory.includes('Finance') || activeTransition.industryCategory.includes('CA')
                                      ? 'Transfer Pricing Local File & Statutory Audit Checklist'
                                      : (activeTransition.industryCategory.includes('Supply')
                                        ? 'Global S&OP Consensus Protocol & Incoterms 2020 Guide'
                                        : 'Production RFC Architecture Specification')))}
                              </h5>
                              <span className="text-[10px] text-slate-400">Executive Playbook (.docx / PDF)</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Enterprise-grade operating framework containing complete governance policies, stakeholder review cadences, and approval sign-off rubrics.
                        </p>
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] text-blue-400 font-semibold">Governance Approved</span>
                          <button
                            onClick={() => {
                              if (!isProUnlocked) {
                                setIsProModalOpen(true);
                              } else {
                                toast.success('Playbook downloaded! Ready for executive presentation.');
                              }
                            }}
                            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Playbook</span>
                          </button>
                        </div>
                      </div>

                      {/* Template 3: Board / C-Suite Presentation Deck Outline */}
                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                              <Tv className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-white">
                                Board of Directors Strategy Presentation (16-Slide Master)
                              </h5>
                              <span className="text-[10px] text-slate-400">PowerPoint Deck (.pptx) • Boardroom calibrated</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Presentation deck covering strategic objectives, ROI justifications, cross-functional risk matrices, and quarterly execution milestones.
                        </p>
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] text-purple-400 font-semibold">C-Suite Ready</span>
                          <button
                            onClick={() => {
                              if (!isProUnlocked) {
                                setIsProModalOpen(true);
                              } else {
                                toast.success('Board Deck downloaded! Ready for executive presentation.');
                              }
                            }}
                            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Deck</span>
                          </button>
                        </div>
                      </div>

                      {/* Template 4: STAR Interview Challenge Script */}
                      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                              <Award className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-white">
                                50+ Role-Specific STAR Interview Guide with Model Responses
                              </h5>
                              <span className="text-[10px] text-slate-400">Executive Interview Guide (.pdf)</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          Exhaustive interview response bank with real situation, task, action, and quantifiable business metric results tailored to {activeTransition.targetRole}.
                        </p>
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] text-amber-400 font-semibold">High-Scoring</span>
                          <button
                            onClick={() => {
                              if (!isProUnlocked) {
                                setIsProModalOpen(true);
                              } else {
                                toast.success('STAR Guide downloaded! Ready for executive presentation.');
                              }
                            }}
                            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Guide</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                ` + oldTabInterviewEnd;

content = content.replace(oldTabInterviewEnd, templatesTabContent);

fs.writeFileSync(targetFilePath, content, 'utf8');
console.log('Successfully added Multi-Dimensional Filter Bar and Pro Value Templates Tab!');
