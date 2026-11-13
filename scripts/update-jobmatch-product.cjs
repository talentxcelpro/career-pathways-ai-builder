// scripts/update-jobmatch-product.cjs
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'products', 'JobMatchProduct.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove upgrade gate in handleApplyClick
content = content.replace(
  /const handleApplyClick = \(job: JobItem\) => {[\s\S]*?setSelectedJobForApply\(job\);/m,
  `const handleApplyClick = (job: JobItem) => {
    setSelectedJobForApply(job);`
);

// 2. Add extra filter states (salaryRange, workMode, savedJobIds, selectedJobDetails)
const stateTarget = "const [selectedCity, setSelectedCity] = useState('all');";
const extraStates = `const [selectedCity, setSelectedCity] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [selectedSalary, setSelectedSalary] = useState('all');
  const [selectedWorkMode, setSelectedWorkMode] = useState('all');
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('txc_saved_jobs') || '[]');
    } catch {
      return [];
    }
  });
  const [showOnlySaved, setShowOnlySaved] = useState(false);
  const [selectedJobDetails, setSelectedJobDetails] = useState<JobItem | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');`;

content = content.replace(stateTarget, extraStates);

// 3. Update toggleSaved function and handleSubscribeAlert
const fnTarget = "const handleResetFilters = () => {";
const extraFns = `const toggleSaveJob = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedJobIds(prev => {
      const updated = prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId];
      try {
        localStorage.setItem('txc_saved_jobs', JSON.stringify(updated));
      } catch {}
      toast.success(prev.includes(jobId) ? 'Job removed from saved list' : 'Job saved to your bookmarks!');
      return updated;
    });
  };

  const handleSubscribeAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    toast.success(\`Daily \${activeCategory.toUpperCase()} job alert activated for \${alertEmail}!\`);
    setIsAlertModalOpen(false);
    setAlertEmail('');
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCity('all');
    setSelectedExperience('all');
    setSelectedSalary('all');
    setSelectedWorkMode('all');
    setShowOnlySaved(false);
  };`;

content = content.replace(
  /const handleResetFilters = \(\) => {[\s\S]*?setSelectedCity\('all'\);\s*};/m,
  extraFns
);

// 4. Update filteredJobs memo with new filters
const filterMemoTarget = /const filteredJobs = useMemo\(\(\) => {[\s\S]*?return true;\s*}\);\s*}, \[jobs, activeCategory, selectedCity, searchTerm\]\);/m;
const newFilterMemo = `const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // 0. Saved jobs filter
      if (showOnlySaved && !savedJobIds.includes(job.id)) return false;

      // 1. Category check
      const jobCategory = categorizeJob(job.title, job.company_name, job.department, job.industry);
      if (jobCategory !== activeCategory) return false;

      // 2. City filter
      if (selectedCity !== 'all') {
        const loc = \`\${job.location_city || ''} \${job.location || ''}\`.toLowerCase();
        if (selectedCity === 'remote') {
          if (!job.is_remote && !loc.includes('remote')) return false;
        } else if (!loc.includes(selectedCity.toLowerCase())) {
          return false;
        }
      }

      // 3. Work mode filter
      if (selectedWorkMode === 'remote' && !job.is_remote && !(job.location || '').toLowerCase().includes('remote')) return false;
      if (selectedWorkMode === 'hybrid' && !(job.location || '').toLowerCase().includes('hybrid')) return false;

      // 4. Salary filter
      if (selectedSalary !== 'all') {
        const minLakhs = (job.salary_min || 0) / 100000;
        if (selectedSalary === '3lpa' && minLakhs < 3) return false;
        if (selectedSalary === '6lpa' && minLakhs < 6) return false;
        if (selectedSalary === '10lpa' && minLakhs < 10) return false;
        if (selectedSalary === '20lpa' && minLakhs < 20) return false;
      }

      // 5. Search query filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const skillsText = (job.skills_required || []).join(' ').toLowerCase();
        const searchableText = \`\${job.title} \${job.company_name} \${job.location} \${job.department || ''} \${job.industry || ''} \${skillsText}\`.toLowerCase();
        if (!searchableText.includes(query)) return false;
      }

      return true;
    });
  }, [jobs, activeCategory, selectedCity, selectedWorkMode, selectedSalary, searchTerm, showOnlySaved, savedJobIds]);`;

content = content.replace(filterMemoTarget, newFilterMemo);

// 5. Add secondary filter row beneath the search container in the Hero Section
const heroSearchTarget = `              <Button 
                onClick={() => {}}
                className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs px-7 py-3 rounded-xl shadow-xs transition-all shrink-0 h-10"
              >
                Find Jobs
              </Button>
            </div>`;

const heroFiltersRow = `              <Button 
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

                <button
                  type="button"
                  onClick={() => setShowOnlySaved(!showOnlySaved)}
                  className={\`px-3 py-1 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 \${
                    showOnlySaved 
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs' 
                      : 'bg-white text-[#64748B] border-[#E2E8F0] hover:text-[#111827]'
                  }\`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Saved Vacancies ({savedJobIds.length})</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsAlertModalOpen(true)}
                className="text-xs text-[#2563EB] hover:text-[#7138E8] font-bold flex items-center gap-1 hover:underline ml-auto"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Get Daily Job Alerts</span>
              </button>
            </div>`;

content = content.replace(heroSearchTarget, heroFiltersRow);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully enriched JobMatchProduct.tsx with advanced filters and zero paywall gate');
