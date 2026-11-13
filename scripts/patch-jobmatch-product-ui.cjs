const fs = require('fs');

let code = fs.readFileSync('src/components/products/JobMatchProduct.tsx', 'utf8');

// 1. Add Star, TalentSparkJobCard, ComprehensiveJobFilters imports
if (!code.includes('TalentSparkJobCard')) {
  code = code.replace(
    "import { JobPortalFooter } from './jobmatch/JobPortalFooter';",
    "import { JobPortalFooter } from './jobmatch/JobPortalFooter';\nimport { TalentSparkJobCard } from '@/components/jobs/TalentSparkJobCard';\nimport { ComprehensiveJobFilters } from '@/components/jobs/ComprehensiveJobFilters';"
  );
}

if (!code.includes('Star,')) {
  code = code.replace(
    'Heart,\n  SlidersHorizontal,',
    'Heart,\n  Star,\n  SlidersHorizontal,'
  );
  code = code.replace(
    'Heart,\r\n  SlidersHorizontal,',
    'Heart,\r\n  Star,\r\n  SlidersHorizontal,'
  );
}

// 2. Add is_featured, views_count, applications_count, experience_level to select
const oldSelect = ".select('id, title, company_name, location, location_city, location_state, employment_type, is_remote, work_mode, salary_min, salary_max, salary_currency, applicant_location_requirements, description, department, industry, external_url, skills_required, application_deadline, expires_at, created_at, job_summary, min_experience, max_experience')";
const newSelect = ".select('id, title, company_name, location, location_city, location_state, employment_type, is_remote, work_mode, salary_min, salary_max, salary_currency, applicant_location_requirements, description, department, industry, external_url, skills_required, application_deadline, expires_at, created_at, job_summary, min_experience, max_experience, is_featured, views_count, applications_count, experience_level')";

if (code.includes(oldSelect)) {
  code = code.replace(oldSelect, newSelect);
}

// 3. Add sidebarFilters state
if (!code.includes('const [sidebarFilters, setSidebarFilters]')) {
  const targetState = "const [pageSize, setPageSize] = useState(15);";
  const newSidebarState = `const [pageSize, setPageSize] = useState(16);
  const [sidebarFilters, setSidebarFilters] = useState<any>({
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
  });`;
  code = code.replace(targetState, newSidebarState);
}

// 4. Update filteredJobs with sidebarFilters integration
if (!code.includes('// Sidebar Filters Integration')) {
  const filterInsertionPoint = "      // Country Filter";
  const filterLogic = `      // Sidebar Filters Integration
      if (sidebarFilters.work_mode && sidebarFilters.work_mode.length > 0) {
        const matchesMode = sidebarFilters.work_mode.some((mode: string) => {
          const m = mode.toLowerCase();
          if (m.includes('home') || m.includes('remote')) {
            return job.is_remote || (job.location || '').toLowerCase().includes('remote') || (job.work_mode || '').toLowerCase().includes('remote');
          }
          if (m.includes('hybrid')) {
            return (job.work_mode || '').toLowerCase().includes('hybrid') || (job.location || '').toLowerCase().includes('hybrid');
          }
          if (m.includes('office')) {
            return (!job.is_remote && !(job.location || '').toLowerCase().includes('remote')) || (job.work_mode || '').toLowerCase().includes('office');
          }
          return false;
        });
        if (!matchesMode) return false;
      }

      if (sidebarFilters.experience_level && sidebarFilters.experience_level.length > 0) {
        const exp = job.min_experience || 0;
        const matchesExp = sidebarFilters.experience_level.some((level: string) => {
          const l = level.toLowerCase();
          if (l.includes('0-1') || l.includes('fresher')) return exp <= 1;
          if (l.includes('1-3')) return exp >= 1 && exp <= 3;
          if (l.includes('3-7') || l.includes('3-5')) return exp >= 3 && exp <= 7;
          if (l.includes('5-10')) return exp >= 5 && exp <= 10;
          if (l.includes('7-12')) return exp >= 7 && exp <= 12;
          if (l.includes('8+')) return exp >= 8;
          if (l.includes('12+')) return exp >= 12;
          if (l.includes('15+')) return exp >= 15;
          return false;
        });
        if (!matchesExp) return false;
      }

      if (sidebarFilters.industry && sidebarFilters.industry.length > 0) {
        const full = \`\${job.title} \${job.company_name} \${job.department || ''} \${job.industry || ''}\`.toLowerCase();
        const matchesInd = sidebarFilters.industry.some((ind: string) => full.includes(ind.toLowerCase()));
        if (!matchesInd) return false;
      }

      if (sidebarFilters.department && sidebarFilters.department.length > 0) {
        const full = \`\${job.title} \${job.department || ''}\`.toLowerCase();
        const matchesDept = sidebarFilters.department.some((dept: string) => full.includes(dept.toLowerCase()));
        if (!matchesDept) return false;
      }

      if (sidebarFilters.company_type && sidebarFilters.company_type.length > 0) {
        const full = \`\${job.company_name} \${(job as any).company_type || ''}\`.toLowerCase();
        const matchesType = sidebarFilters.company_type.some((type: string) => full.includes(type.toLowerCase()));
        if (!matchesType) return false;
      }

      // Country Filter`;
  code = code.replace(filterInsertionPoint, filterLogic);
}

// 5. Update useEffect dependency array for pagination reset
if (!code.includes('sidebarFilters')) {
  code = code.replace(
    'selectedCategory8, selectedSubTab]);',
    'selectedCategory8, selectedSubTab, sidebarFilters]);'
  );
}

// 6. Add featuredJobs calculation
if (!code.includes('const featuredJobs = useMemo')) {
  const sortedJobsTarget = '  const totalPages = Math.ceil(sortedJobs.length / pageSize) || 1;';
  const featuredAddition = `  const featuredJobs = useMemo(() => {
    return sortedJobs.filter(j => j.is_featured);
  }, [sortedJobs]);

  const totalPages = Math.ceil(sortedJobs.length / pageSize) || 1;`;
  code = code.replace(sortedJobsTarget, featuredAddition);
}

fs.writeFileSync('src/components/products/JobMatchProduct.tsx', code, 'utf8');
console.log('JobMatchProduct step 1 patched successfully');
