const fs = require('fs');

let content = fs.readFileSync('src/components/products/JobMatchProduct.tsx', 'utf8');

// 1. Add id="search-hero" to hero section
content = content.replace(
  '<section className="bg-gradient-to-b from-white via-white to-[#F4F7FC]',
  '<section id="search-hero" className="bg-gradient-to-b from-white via-white to-[#F4F7FC]'
);

// 2. Add Experience and Employment Type filter in Micro-Filters Row
const oldMicroFilters = `<select 
                      value={selectedWorkMode}
                      onChange={(e) => setSelectedWorkMode(e.target.value)}
                      className="bg-white border border-[#E2E8F0] rounded-xl px-2.5 py-1 text-xs font-semibold text-[#111827] focus:outline-hidden cursor-pointer"
                    >
                      <option value="all">Any Work Mode</option>
                      <option value="remote">Remote Only</option>
                      <option value="hybrid">Hybrid</option>
                    </select>`;

const newMicroFilters = `<select 
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
                    </select>`;

// Replace micro filters
content = content.replace(oldMicroFilters, newMicroFilters);

// 3. Update job cards to map over paginatedJobs and add Inspect Role button
const oldMapAnchor = `filteredJobs.map(job => {`;
const newMapReplacement = `paginatedJobs.map(job => {`;
content = content.replace(oldMapAnchor, newMapReplacement);

// Add Inspect Role button next to 1-Click Apply
const oldApplyColAnchor = `<Button
                              size="sm"
                              onClick={() => handleApplyClick(job)}
                              className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs"
                            >
                              1-Click Apply
                            </Button>`;

const newApplyColReplacement = `<Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(\`/jobs/\${generateSlug(job.title, job.id)}\`)}
                              className="text-xs font-semibold rounded-xl text-[#2563EB] border-blue-200 hover:bg-blue-50 h-9 px-3"
                            >
                              Inspect Role →
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => handleApplyClick(job)}
                              className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs h-9"
                            >
                              1-Click Apply
                            </Button>`;

content = content.replace(oldApplyColAnchor, newApplyColReplacement);

// 4. Add pagination and Marketplace Discovery Grids below </Tabs></section>
const oldTabsSectionEnd = `              </Tabs>
            </section>
          </div>
        )}`;

const newTabsSectionEnd = `              </Tabs>

              {/* ── Pagination Controls ── */}
              {totalPages > 1 && (
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E2E8F0] text-xs">
                  <span className="text-[#64748B]">
                    Showing <strong className="text-[#111827]">{(currentPage - 1) * pageSize + 1}</strong> –{' '}
                    <strong className="text-[#111827]">{Math.min(currentPage * pageSize, filteredJobs.length)}</strong> of{' '}
                    <strong className="text-[#111827]">{filteredJobs.length.toLocaleString()}</strong> matching vacancies
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage(p => Math.max(1, p - 1));
                        const el = document.getElementById('search-hero');
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
                            const el = document.getElementById('search-hero');
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
                        const el = document.getElementById('search-hero');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-xs h-8 px-3 rounded-lg"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </section>

            {/* ── B, C, D, F, H: Complete Marketplace Discovery Grids ── */}
            <div className="py-12 border-t border-[#E2E8F0] bg-white">
              <JobPortalDiscoveryGrid 
                onSelectCategory={(cat) => {
                  setActiveCategory(cat.id === 'cat-psu' ? 'core' : cat.id.includes('soft') ? 'tech' : 'non-tech');
                  setSearchTerm(cat.name);
                  const el = document.getElementById('search-hero');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onSelectLocation={(loc) => {
                  setSelectedCity(loc.slug);
                  const el = document.getElementById('search-hero');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onSelectCompany={(comp) => {
                  setSearchTerm(comp.name);
                  const el = document.getElementById('search-hero');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                totalActiveCount={totalCount}
                recent30DaysCount={1688}
              />
            </div>

            {/* ── G. Comprehensive Public Career Resources (Part 2-G) ── */}
            <CareerResourcesSection />
          </div>
        )}`;

content = content.replace(oldTabsSectionEnd, newTabsSectionEnd);

fs.writeFileSync('src/components/products/JobMatchProduct.tsx', content, 'utf8');
console.log('Successfully patched JobMatchProduct with full marketplace UI!');
