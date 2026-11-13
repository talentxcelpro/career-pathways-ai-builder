const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'src', 'components', 'products', 'JobMatchProduct.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Add mobileFiltersOpen state
const stateTarget = "  const [selectedSubTab, setSelectedSubTab] = useState<'all' | 'remote' | 'freshers' | 'high_paying'>('all');";
const stateReplacement = `  const [selectedSubTab, setSelectedSubTab] = useState<'all' | 'remote' | 'freshers' | 'high_paying'>('all');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);`;

if (content.includes(stateTarget)) {
  content = content.replace(stateTarget, stateReplacement);
  console.log('✅ Added mobileFiltersOpen state');
} else {
  console.error('❌ Could not find stateTarget');
}

// 2. Add activeFilterCount memo
const filterCountMemo = `
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCountry !== 'all') count++;
    if (selectedCurrency !== 'all') count++;
    if (selectedEligibility !== 'all') count++;
    if (selectedExperience !== 'all') count++;
    if (selectedSalary !== 'all') count++;
    if (selectedWorkMode !== 'all') count++;
    if (selectedEmploymentType !== 'all') count++;
    if (selectedIndustry !== 'all') count++;
    if (selectedCategory8 !== 'all') count++;
    if (selectedCity !== 'all') count++;
    return count;
  }, [selectedCountry, selectedCurrency, selectedEligibility, selectedExperience, selectedSalary, selectedWorkMode, selectedEmploymentType, selectedIndustry, selectedCategory8, selectedCity]);
`;

// Insert activeFilterCount right after filteredJobs useMemo
const filteredJobsEndTarget = "  }, [searchTerm, selectedCity, selectedCountry, selectedCurrency, selectedEligibility, selectedWorkMode, selectedSalary, selectedExperience, selectedEmploymentType, selectedIndustry, selectedCategory8, selectedSubTab, sidebarFilters]);";
if (content.includes(filteredJobsEndTarget)) {
  content = content.replace(filteredJobsEndTarget, filteredJobsEndTarget + '\n' + filterCountMemo);
  console.log('✅ Added activeFilterCount calculation');
} else {
  console.error('❌ Could not find filteredJobsEndTarget');
}

// 3. Make hero headline section hidden on mobile (hidden md:block) and add compact mobile header
const heroHeadlineTarget = `                  {/* Left Column: Headline, Subtitle & Fast Action Buttons */}
                  <div className="lg:col-span-7 space-y-4 text-left">`;

const heroHeadlineReplacement = `                  {/* Mobile Compact Header (takes ~24px height on mobile so jobs appear immediately) */}
                  <div className="md:hidden flex items-center justify-between gap-2 pb-0.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#2563EB]" />
                      <span className="text-sm font-black text-[#111827]">TalentXcel Jobs</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono text-[#2563EB] bg-blue-50/80 border-blue-200">
                      {totalCount > 0 ? \`\${totalCount.toLocaleString()} Live\` : '2,282 Live'}
                    </Badge>
                  </div>

                  {/* Left Column: Headline, Subtitle & Fast Action Buttons (Visible on md+ screens) */}
                  <div className="lg:col-span-7 space-y-4 text-left hidden md:block">`;

if (content.includes(heroHeadlineTarget)) {
  content = content.replace(heroHeadlineTarget, heroHeadlineReplacement);
  console.log('✅ Made large hero headline hidden on mobile, added compact mobile header');
} else {
  console.error('❌ Could not find heroHeadlineTarget');
}

// 4. Update search-hero padding from px-4 pt-6 pb-8 to px-3 sm:px-4 pt-3 sm:pt-6 pb-3 sm:pb-6
const heroSectionTarget = '<section id="search-hero" className="bg-gradient-to-b from-white via-white to-[#F8FAFC] px-4 pt-6 pb-8 border-b border-[#E2E8F0]">';
const heroSectionReplacement = '<section id="search-hero" className="bg-gradient-to-b from-white via-white to-[#F8FAFC] px-3 sm:px-4 pt-3 sm:pt-6 pb-3 sm:pb-6 border-b border-[#E2E8F0]">';

if (content.includes(heroSectionTarget)) {
  content = content.replace(heroSectionTarget, heroSectionReplacement);
  console.log('✅ Reduced hero section padding for mobile');
}

// 5. Wrap Dropdown Filters row with mobile collapsible toggle button
const dropdownFilterTarget = `                  {/* Dropdown Filters Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">`;

const dropdownFilterReplacement = `                  {/* Mobile Filter Toggle Button (collapses 8 filter dropdowns so jobs are visible first on mobile) */}
                  <div className="md:hidden flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                      className={\`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all \${
                        activeFilterCount > 0
                          ? 'bg-blue-50 border-[#2563EB] text-[#2563EB]'
                          : 'bg-white border-[#E2E8F0] text-[#334155]'
                      }\`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>{mobileFiltersOpen ? 'Hide Quick Filters' : 'Filter by Country, Currency & Work Mode'}</span>
                      {activeFilterCount > 0 && (
                        <span className="bg-[#2563EB] text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                          {activeFilterCount}
                        </span>
                      )}
                      <ChevronDown className={\`w-3.5 h-3.5 transition-transform \${mobileFiltersOpen ? 'rotate-180' : ''}\`} />
                    </button>
                  </div>

                  {/* Dropdown Filters Row: Always visible on desktop (md+), collapsible on mobile */}
                  <div className={\`\${mobileFiltersOpen ? 'flex' : 'hidden md:flex'} flex-wrap items-center justify-between gap-2 text-xs pt-1\`}>`;

if (content.includes(dropdownFilterTarget)) {
  content = content.replace(dropdownFilterTarget, dropdownFilterReplacement);
  console.log('✅ Added mobile filter toggle button and made dropdown filters collapsible on mobile');
} else {
  console.error('❌ Could not find dropdownFilterTarget');
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('✅ Mobile optimization patch applied successfully');
