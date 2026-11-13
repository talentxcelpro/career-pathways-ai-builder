const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'src', 'components', 'products', 'JobMatchProduct.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Remove the 4 feature cards and browse categories from between search and jobs
// Find block starting with:
//                   {/* 4 FEATURE CARDS: AI Match, Zero Ghost Listings, AI Interview Simulator, Transparent Benchmarks */}
// and ending with:
//             </section>
// (right before {/* 2-COLUMN MARKETPLACE SECTION: LATEST JOBS & SIDEBAR */})

const startMarker = "                  {/* 4 FEATURE CARDS: AI Match, Zero Ghost Listings, AI Interview Simulator, Transparent Benchmarks */}";
const endMarker = "            {/* 2-COLUMN MARKETPLACE SECTION: LATEST JOBS & SIDEBAR */}";

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('❌ Could not find markers. startIdx:', startIdx, 'endIdx:', endIdx);
  process.exit(1);
}

// Slice out the middle block and close the search section cleanly
const beforeBlock = content.slice(0, startIdx);
const afterBlock = content.slice(endIdx);

// Notice beforeBlock ends inside:
//                   </div>
//                 </div>
//               </div>
//             </section>
// Let's verify what beforeBlock has right before startMarker
console.log('Trailing chars before startMarker:', JSON.stringify(beforeBlock.slice(-80)));

// We need to keep:
//                 </div>
//               </div>
//             </section>
// and then afterBlock begins with:
//             {/* 2-COLUMN MARKETPLACE SECTION: LATEST JOBS & SIDEBAR */}

const cleanedMiddle = `                </div>
              </div>
            </section>

`;

content = beforeBlock.trimEnd() + '\n' + cleanedMiddle + afterBlock;
console.log('✅ Removed 4 feature cards and category section from above jobs');

// 2. Add quick category chips for mobile/tablet right inside middle column before ATS banner
const atsMarker = "                  {/* Compact Value Proposition Banner (matching screenshot) */}";
const atsIdx = content.indexOf(atsMarker);
if (atsIdx !== -1) {
  const mobileCategoryChips = `                  {/* Quick Category Chips for Mobile & Tablet (visible when right sidebar is hidden) */}
                  <div className="xl:hidden flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                    {CATEGORIES_DATA.map(cat => {
                      const Icon = cat.icon;
                      const isSelected = selectedCategory8 === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory8(isSelected ? 'all' : cat.id);
                            setCurrentPage(1);
                          }}
                          className={\`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 border transition-all shrink-0 \${
                            isSelected
                              ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                              : 'bg-white text-[#334155] border-[#E2E8F0] hover:border-slate-300'
                          }\`}
                        >
                          <Icon className={\`w-3.5 h-3.5 \${isSelected ? 'text-white' : cat.iconColor}\`} />
                          <span>{cat.name}</span>
                          <span className={\`text-[10px] font-mono \${isSelected ? 'text-blue-100' : 'text-[#64748B]'}\`}>({cat.count})</span>
                        </button>
                      );
                    })}
                  </div>

`;
  content = content.slice(0, atsIdx) + mobileCategoryChips + content.slice(atsIdx);
  console.log('✅ Added mobile category chips in main column');
}

// 3. Add the Right Sidebar into latest-jobs-section (right after middle content div closes)
const rightSidebarCode = `
                {/* RIGHT SIDEBAR: AI Career Tools & Category Hub (Sticky beside jobs) */}
                <aside className="w-80 flex-shrink-0 hidden xl:block space-y-4" aria-label="AI Career Hub & Categories">
                  
                  {/* Block 1: AI Career Tools & Quality */}
                  <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#F1F5F9]">
                      <Sparkles className="w-4 h-4 text-[#7138E8]" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#111827]">
                        AI Career Tools
                      </h3>
                      <Badge variant="secondary" className="ml-auto bg-purple-50 text-[#7138E8] text-[10px] font-bold">
                        Verified
                      </Badge>
                    </div>

                    <div className="space-y-2.5">
                      {/* Tool 1: AI Compatibility Match */}
                      <div
                        onClick={() => setAiMatchModalOpen(true)}
                        className="p-3 rounded-xl border border-purple-200/80 hover:border-purple-400 bg-purple-50/30 hover:bg-purple-50/60 transition-all cursor-pointer flex items-start gap-2.5 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#7138E8] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-[#111827] group-hover:text-[#7138E8] transition-colors leading-tight flex items-center justify-between">
                            <span>AI Compatibility Match</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#7138E8] group-hover:translate-x-0.5 transition-all" />
                          </div>
                          <div className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                            Real-time skill gap analysis & instant score
                          </div>
                        </div>
                      </div>

                      {/* Tool 2: Zero Ghost Listings */}
                      <div
                        onClick={() => {
                          setSelectedSubTab('all');
                          setSelectedCategory8('all');
                          toast.success('Zero Ghost Listings: All active vacancies are unexpired, pre-screened and directly verified.');
                        }}
                        className="p-3 rounded-xl border border-blue-200/80 hover:border-blue-400 bg-blue-50/30 hover:bg-blue-50/60 transition-all cursor-pointer flex items-start gap-2.5 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors leading-tight flex items-center justify-between">
                            <span>Zero Ghost Listings</span>
                            <span className="text-[10px] bg-blue-100 text-[#2563EB] font-bold px-1.5 py-0.2 rounded">100% Direct</span>
                          </div>
                          <div className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                            100% unexpired verified routing
                          </div>
                        </div>
                      </div>

                      {/* Tool 3: AI Interview Simulator */}
                      <div
                        onClick={() => openInterviewCoach()}
                        className="p-3 rounded-xl border border-amber-200/80 hover:border-amber-400 bg-amber-50/30 hover:bg-amber-50/60 transition-all cursor-pointer flex items-start gap-2.5 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-[#111827] group-hover:text-amber-700 transition-colors leading-tight flex items-center justify-between">
                            <span>AI Interview Simulator</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
                          </div>
                          <div className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                            Practice specific role Q&A & feedback
                          </div>
                        </div>
                      </div>

                      {/* Tool 4: Transparent Benchmarks */}
                      <a
                        href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://salary.localhost:8080' : 'https://salary.talentxcel.in'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl border border-emerald-200/80 hover:border-emerald-400 bg-emerald-50/30 hover:bg-emerald-50/60 transition-all cursor-pointer flex items-start gap-2.5 group block"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                          <BarChart3 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-[#111827] group-hover:text-emerald-700 transition-colors leading-tight flex items-center justify-between">
                            <span>Transparent Benchmarks</span>
                            <ExternalLink className="w-3 h-3 text-[#94A3B8] group-hover:text-emerald-700" />
                          </div>
                          <div className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                            Real CTC percentiles & compensation
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Block 2: Browse by Industry / Category */}
                  <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#2563EB]" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-[#111827]">
                          Browse Categories
                        </h3>
                      </div>
                      {selectedCategory8 !== 'all' && (
                        <button
                          onClick={() => setSelectedCategory8('all')}
                          className="text-[10px] font-bold text-[#2563EB] hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                      {CATEGORIES_DATA.map(cat => {
                        const Icon = cat.icon;
                        const isSelected = selectedCategory8 === cat.id;

                        return (
                          <div
                            key={cat.id}
                            onClick={() => {
                              setSelectedCategory8(isSelected ? 'all' : cat.id);
                              setCurrentPage(1);
                            }}
                            className={\`p-2 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer \${
                              isSelected
                                ? 'bg-blue-50/90 border-[#2563EB] shadow-2xs ring-1 ring-[#2563EB]'
                                : 'bg-white border-transparent hover:border-[#E2E8F0] hover:bg-slate-50/80'
                            }\`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={\`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 \${cat.bg} \${cat.iconColor}\`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className={\`text-xs font-semibold truncate \${isSelected ? 'text-[#2563EB]' : 'text-[#334155]'}\`}>
                                {cat.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold font-mono text-[#64748B] bg-slate-100 px-1.5 py-0.5 rounded-md shrink-0">
                              {cat.count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </aside>
`;

const discoveryGridMarker = '{/* Comprehensive Marketplace Discovery Grids (Cities, Categories, Employers) */}';
const discIdx = content.indexOf(discoveryGridMarker);

if (discIdx === -1) {
  console.error('❌ Could not find discoveryGridMarker');
  process.exit(1);
}

// Find the closing </div> of flex gap-6 right before </section>
const beforeDisc = content.slice(0, discIdx);
const lastSectionClose = beforeDisc.lastIndexOf('</section>');
const lastFlexDivClose = beforeDisc.lastIndexOf('</div>', lastSectionClose - 1);

console.log('Inserting right sidebar before lastFlexDivClose at:', lastFlexDivClose);
content = beforeDisc.slice(0, lastFlexDivClose) + rightSidebarCode + beforeDisc.slice(lastFlexDivClose) + content.slice(discIdx);

// 4. Update container width to max-w-[1440px] for 3-column breadth
content = content.replace(
  '<section id="latest-jobs-section" className="max-w-7xl mx-auto px-4 pb-16">',
  '<section id="latest-jobs-section" className="max-w-[1440px] mx-auto px-4 pb-16">'
);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('✅ JobMatchProduct.tsx successfully patched with Right Sidebar and brought jobs up!');
