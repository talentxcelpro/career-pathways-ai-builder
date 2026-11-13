const fs = require('fs');

let content = fs.readFileSync('src/components/products/JobMatchProduct.tsx', 'utf8');

// 1. Add imports if not present
if (!content.includes('JobPortalDiscoveryGrid')) {
  content = content.replace(
    "import { AIInterviewPrepCoach } from './jobmatch/AIInterviewPrepCoach';",
    "import { AIInterviewPrepCoach } from './jobmatch/AIInterviewPrepCoach';\nimport { JobPortalDiscoveryGrid, CategoryCardData, LocationCardData, CompanyCardData } from './jobmatch/JobPortalDiscoveryGrid';\nimport { CareerResourcesSection } from './jobmatch/CareerResourcesSection';\nimport { JobPortalFooter } from './jobmatch/JobPortalFooter';"
  );
}

// 2. Add generateSlug helper if not present
if (!content.includes('function generateSlug')) {
  content = content.replace(
    "function formatSalary(min?: number, max?: number): string | null {",
    `function generateSlug(title: string, id: string): string {
  const cleanTitle = (title || 'job')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return \`\${cleanTitle}-\${id}\`;
}

function formatSalary(min?: number, max?: number): string | null {`
  );
}

// 3. Add filters, sorting & pagination state
if (!content.includes('const [currentPage, setCurrentPage]')) {
  content = content.replace(
    "const [selectedWorkMode, setSelectedWorkMode] = useState('all');",
    `const [selectedWorkMode, setSelectedWorkMode] = useState('all');
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('all');
  const [sortBy, setSortBy] = useState<'latest' | 'salary_high' | 'experience'>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;`
  );
}

// 4. Update filteredJobs and add sortedJobs & paginatedJobs
const oldFilteredJobsAnchor = `      // Search query filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const skillsText = (job.skills_required || []).join(' ').toLowerCase();
        const searchableText = \`\${job.title} \${job.company_name} \${job.location} \${job.department || ''} \${job.industry || ''} \${skillsText}\`.toLowerCase();
        if (!searchableText.includes(query)) return false;
      }

      return true;
    });
  }, [jobs, activeCategory, selectedCity, selectedWorkMode, selectedSalary, searchTerm, activeTab, savedJobIds]);`;

const newFilteredJobsBlock = `      // Employment type filter
      if (selectedEmploymentType !== 'all') {
        const emp = (job.employment_type || '').toLowerCase();
        if (!emp.includes(selectedEmploymentType.toLowerCase())) return false;
      }

      // Search query filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const skillsText = (job.skills_required || []).join(' ').toLowerCase();
        const searchableText = \`\${job.title} \${job.company_name} \${job.location} \${job.department || ''} \${job.industry || ''} \${skillsText}\`.toLowerCase();
        if (!searchableText.includes(query)) return false;
      }

      return true;
    });
  }, [jobs, activeCategory, selectedCity, selectedWorkMode, selectedSalary, selectedEmploymentType, searchTerm, activeTab, savedJobIds]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCity, selectedWorkMode, selectedSalary, selectedEmploymentType, activeCategory]);

  const sortedJobs = useMemo(() => {
    const list = [...filteredJobs];
    if (sortBy === 'salary_high') {
      list.sort((a, b) => (b.salary_max || b.salary_min || 0) - (a.salary_max || a.salary_min || 0));
    } else if (sortBy === 'experience') {
      list.sort((a, b) => (a.min_experience || 0) - (b.min_experience || 0));
    } else {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return list;
  }, [filteredJobs, sortBy]);

  const totalPages = Math.ceil(sortedJobs.length / pageSize) || 1;
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedJobs.slice(start, start + pageSize);
  }, [sortedJobs, currentPage]);`;

// Normalize \r\n for replacement
const isCRLF = content.includes('\r\n');
let normContent = content.replace(/\r\n/g, '\n');
const normAnchor = oldFilteredJobsAnchor.replace(/\r\n/g, '\n');
const normReplacement = newFilteredJobsBlock.replace(/\r\n/g, '\n');

if (normContent.includes(normAnchor)) {
  normContent = normContent.replace(normAnchor, normReplacement);
  console.log('Updated filteredJobs and pagination successfully!');
} else {
  console.log('Anchor for filteredJobs not found, checking manual...');
}

// 5. Replace ProductFooter with JobPortalFooter
normContent = normContent.replace(
  '<ProductFooter currentProduct="JobMatch OS" />',
  '<JobPortalFooter />'
);

const finalOut = isCRLF ? normContent.replace(/\n/g, '\r\n') : normContent;
fs.writeFileSync('src/components/products/JobMatchProduct.tsx', finalOut, 'utf8');
console.log('JobMatchProduct.tsx partially updated with helper imports and state.');
