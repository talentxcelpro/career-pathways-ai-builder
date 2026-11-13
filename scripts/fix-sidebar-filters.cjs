const fs = require('fs');
let code = fs.readFileSync('src/components/products/JobMatchProduct.tsx', 'utf8');

const target = '  const pageSize = 10;';
const replacement = `  const pageSize = 10;
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

if (code.includes(target) && !code.includes('const [sidebarFilters, setSidebarFilters]')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/products/JobMatchProduct.tsx', code, 'utf8');
  console.log('Successfully inserted sidebarFilters definition');
} else {
  console.log('Already present or target not found');
}
