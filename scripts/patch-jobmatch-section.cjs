const fs = require('fs');

let code = fs.readFileSync('src/components/products/JobMatchProduct.tsx', 'utf8');

const startTag = '{/* 2-COLUMN MARKETPLACE SECTION: LATEST JOBS & SIDEBAR */}';
const endTag = '{/* Comprehensive Marketplace Discovery Grids (Cities, Categories, Employers) */}';

const startIndex = code.indexOf(startTag);
const endIndex = code.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find start or end tags', { startIndex, endIndex });
  process.exit(1);
}

const replacement = `{/* 2-COLUMN MARKETPLACE SECTION: LATEST JOBS & SIDEBAR */}
            <section id="latest-jobs-section" className="max-w-7xl mx-auto px-4 pb-16">
              <div className="flex gap-6 items-start">
                
                {/* LEFT SIDEBAR: ComprehensiveJobFilters (Sticky, matching screenshot) */}
                <aside className="w-72 flex-shrink-0 hidden lg:block" aria-label="Job Filters">
                  <ComprehensiveJobFilters
                    filters={sidebarFilters}
                    onFiltersChange={setSidebarFilters}
                    onClearFilters={() => {
                      setSidebarFilters({
                        search: '',
                        location: '',
                        employment_type: [],
                        experience_level: [],
                        salary_min: 0,
                        salary_max: 0,
                        is_remote: false,
                        skills: [],
                        department: [],
                        company_type: [],
                        work_mode: [],
                        industry: [],
                        role_category: [],
                        education: [],
                        posted_by: [],
                        freshness: [],
                        company_id: ''
                      });
                      resetAllFilters();
                    }}
                    className="sticky top-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto scrollbar-thin shadow-xs border-[#E2E8F0] bg-white rounded-2xl"
                  />
                </aside>

                {/* RIGHT MAIN CONTENT: ATS Banner + Featured + 2-Column Cards Grid */}
                <div className="flex-1 min-w-0 space-y-4">
                  
                  {/* Compact Value Proposition Banner (matching screenshot) */}
                  <div className="bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 rounded-xl px-3.5 py-2 flex items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span className="text-[#111827] truncate text-xs">
                        <strong className="font-semibold">Optimize Your Application:</strong> Free instant ATS match score against any role.
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        conversionTelemetry.track('signup_cta_click', { source: 'jobs' });
                        conversionTelemetry.setAcquisitionContext('jobs', '/jobs');
                        window.location.href = 'https://talentxcel.in/resume/ats-check?source=jobs';
                      }}
                      className="h-6 px-2.5 text-[11px] shrink-0 font-semibold border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
                    >
                      Free ATS Audit →
                    </Button>
                  </div>

                  {/* Featured Opportunities Section (matching screenshot) */}
                  {featuredJobs.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2.5">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <h2 className="text-sm sm:text-base font-bold text-[#111827]">Featured Opportunities</h2>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0 font-semibold">Premium</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {featuredJobs.slice(0, 4).map((job) => (
                          <TalentSparkJobCard
                            key={job.id}
                            job={job}
                            onSave={(id) => toggleSaveJob(id)}
                            onQuickApply={(id) => handleApplyClick(jobs.find(j => j.id === id) || job)}
                            onApplyClick={(j) => handleApplyClick(j)}
                            onViewDetails={(j) => setSelectedJobForDetail(j)}
                            isSaved={savedJobIds.includes(job.id)}
                            txcReward={15}
                            viewMode="card"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Header & Sub-Tabs Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Briefcase className="w-4 h-4 text-[#2563EB]" />
                      <h3 className="text-base sm:text-lg font-black text-[#111827]">
                        All Verified Openings
                      </h3>
                      <Badge variant="outline" className="text-xs font-mono font-semibold text-[#64748B] border-[#E2E8F0]">
                        {filteredJobs.length.toLocaleString()} total
                      </Badge>
                    </div>

                    {/* Sub-Tabs: All Jobs | Remote | Freshers | High Paying */}
                    <div className="flex items-center gap-3 text-xs font-bold">
                      <button
                        onClick={() => setSelectedSubTab('all')}
                        className={\`pb-1 transition-colors relative \${
                          selectedSubTab === 'all'
                            ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                            : 'text-[#64748B] hover:text-[#111827]'
                        }\`}
                      >
                        All Jobs
                      </button>
                      <button
                        onClick={() => setSelectedSubTab('remote')}
                        className={\`pb-1 transition-colors relative \${
                          selectedSubTab === 'remote'
                            ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                            : 'text-[#64748B] hover:text-[#111827]'
                        }\`}
                      >
                        Remote
                      </button>
                      <button
                        onClick={() => setSelectedSubTab('freshers')}
                        className={\`pb-1 transition-colors relative \${
                          selectedSubTab === 'freshers'
                            ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                            : 'text-[#64748B] hover:text-[#111827]'
                        }\`}
                      >
                        Freshers
                      </button>
                      <button
                        onClick={() => setSelectedSubTab('high_paying')}
                        className={\`pb-1 transition-colors relative \${
                          selectedSubTab === 'high_paying'
                            ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                            : 'text-[#64748B] hover:text-[#111827]'
                        }\`}
                      >
                        High Paying
                      </button>
                    </div>
                  </div>

                  {/* 2-COLUMN RESPONSIVE JOBS GRID (matching screenshot) */}
                  <div className="pt-1">
                    {errorState ? (
                      <div className="bg-white border border-red-200 p-8 rounded-2xl text-center space-y-3">
                        <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto font-bold text-lg">!</div>
                        <h4 className="font-bold text-base text-[#111827]">Unable to load vacancies from database</h4>
                        <p className="text-xs text-[#64748B] max-w-md mx-auto">{errorState}</p>
                        <Button size="sm" onClick={fetchJobs} className="bg-[#2563EB] text-white text-xs rounded-xl">
                          Retry Connection
                        </Button>
                      </div>
                    ) : loading ? (
                      <div className="p-12 text-center text-xs font-semibold text-[#64748B] space-y-2">
                        <Clock className="w-6 h-6 text-[#2563EB] animate-spin mx-auto" />
                        <div>Loading verified vacancies from Supabase...</div>
                      </div>
                    ) : filteredJobs.length === 0 ? (
                      <div className="bg-white border border-[#E2E8F0] p-10 rounded-2xl text-center space-y-3">
                        <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                        <h4 className="font-bold text-base text-[#111827]">No vacancies found matching your filters</h4>
                        <p className="text-xs text-[#64748B]">
                          Out of {totalCount.toLocaleString()} verified vacancies, none matched your criteria.
                        </p>
                        <Button
                          size="sm"
                          onClick={resetAllFilters}
                          className="text-xs bg-[#2563EB] text-white rounded-xl"
                        >
                          Reset All Filters
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paginatedJobs.map((job) => (
                          <TalentSparkJobCard
                            key={job.id}
                            job={job}
                            onSave={(id) => toggleSaveJob(id)}
                            onQuickApply={(id) => handleApplyClick(jobs.find(j => j.id === id) || job)}
                            onApplyClick={(j) => handleApplyClick(j)}
                            onViewDetails={(j) => setSelectedJobForDetail(j)}
                            isSaved={savedJobIds.includes(job.id)}
                            txcReward={15}
                            viewMode="card"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E2E8F0] text-xs">
                      <span className="text-[#64748B]">
                        Showing <strong className="text-[#111827]">{(currentPage - 1) * pageSize + 1}</strong> -{' '}
                        <strong className="text-[#111827]">{Math.min(currentPage * pageSize, filteredJobs.length)}</strong> of{' '}
                        <strong className="text-[#111827]">{filteredJobs.length.toLocaleString()}</strong> vacancies
                      </span>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => {
                            setCurrentPage(p => Math.max(1, p - 1));
                            const el = document.getElementById('latest-jobs-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="text-xs h-8 px-3 rounded-lg"
                        >
                          Previous
                        </Button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pNum = i + 1;
                          if (totalPages > 5 && currentPage > 3) {
                            pNum = currentPage - 2 + i;
                            if (pNum > totalPages) pNum = totalPages - (4 - i);
                          }
                          return (
                            <Button
                              key={pNum}
                              variant={currentPage === pNum ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                setCurrentPage(pNum);
                                const el = document.getElementById('latest-jobs-section');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className={\`text-xs h-8 w-8 p-0 rounded-lg \${
                                currentPage === pNum ? 'bg-[#2563EB] text-white font-bold' : 'text-[#475569]'
                              }\`}
                            >
                              {pNum}
                            </Button>
                          );
                        })}

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === totalPages}
                          onClick={() => {
                            setCurrentPage(p => Math.min(totalPages, p + 1));
                            const el = document.getElementById('latest-jobs-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="text-xs h-8 px-3 rounded-lg"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </section>

            `;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);

fs.writeFileSync('src/components/products/JobMatchProduct.tsx', code, 'utf8');
console.log('latest-jobs-section patched with 2-column grid and ComprehensiveJobFilters sidebar successfully');
