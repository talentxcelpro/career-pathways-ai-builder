import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FilterCounts {
  experience: { label: string; value: string; count: number }[];
  salary: { label: string; min: number; max: number; count: number }[];
  department: { label: string; value: string; count: number }[];
  companyType: { label: string; value: string; count: number }[];
  workMode: { label: string; value: string; count: number }[];
  industry: { label: string; value: string; count: number }[];
  roleCategory: { label: string; value: string; count: number }[];
  education: { label: string; value: string; count: number }[];
  postedBy: { label: string; value: string; count: number }[];
  freshness: { label: string; value: string; count: number }[];
}

export const useJobFilterCounts = () => {
  return useQuery({
    queryKey: ['job-filter-counts'],
    queryFn: async (): Promise<FilterCounts> => {
      // Base query for active jobs
      const baseQuery = supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .eq('job_status', 'open')
        .gte('expires_at', new Date().toISOString());

      // Get all jobs for counting
      const { data: jobs, error } = await baseQuery;
      
      if (error) {
        console.error('Error fetching jobs for filter counts:', error);
        throw error;
      }

      const jobsData = jobs || [];

      // Experience level counts
      const experienceCounts = [
        { label: '0-1 Years', value: 'entry', count: 0 },
        { label: '1-3 Years', value: 'junior', count: 0 },
        { label: '3-7 Years', value: 'mid', count: 0 },
        { label: '5-10 Years', value: 'senior', count: 0 },
        { label: '7-12 Years', value: 'lead', count: 0 },
        { label: '8+ Years', value: 'principal', count: 0 },
        { label: '12+ Years', value: 'director', count: 0 },
        { label: '15+ Years', value: 'executive', count: 0 },
      ];

      jobsData.forEach(job => {
        const exp = job.experience_level;
        const expItem = experienceCounts.find(item => item.value === exp);
        if (expItem) expItem.count++;
      });

      // Salary range counts
      const salaryCounts = [
        { label: '0-3 Lakhs', min: 0, max: 300000, count: 0 },
        { label: '3-6 Lakhs', min: 300000, max: 600000, count: 0 },
        { label: '6-10 Lakhs', min: 600000, max: 1000000, count: 0 },
        { label: '10-15 Lakhs', min: 1000000, max: 1500000, count: 0 },
        { label: '15-25 Lakhs', min: 1500000, max: 2500000, count: 0 },
        { label: '25+ Lakhs', min: 2500000, max: 999999999, count: 0 },
      ];

      jobsData.forEach(job => {
        const maxSalary = job.salary_max || job.salary_min || 0;
        const salaryItem = salaryCounts.find(item => 
          maxSalary >= item.min && maxSalary < item.max
        );
        if (salaryItem) salaryItem.count++;
      });

      // Department counts
      const departmentCounts = [
        { label: 'Engineering', value: 'engineering', count: 0 },
        { label: 'Marketing', value: 'marketing', count: 0 },
        { label: 'Sales', value: 'sales', count: 0 },
        { label: 'Design', value: 'design', count: 0 },
        { label: 'Product', value: 'product', count: 0 },
        { label: 'Human Resources', value: 'hr', count: 0 },
        { label: 'Finance', value: 'finance', count: 0 },
        { label: 'Operations', value: 'operations', count: 0 },
      ];

      jobsData.forEach(job => {
        const dept = job.department?.toLowerCase();
        const deptItem = departmentCounts.find(item => 
          dept === item.value || job.title?.toLowerCase().includes(item.value)
        );
        if (deptItem) deptItem.count++;
      });

      // Company type counts
      const companyTypeCounts = [
        { label: 'Startup', value: 'startup', count: 0 },
        { label: 'MNC', value: 'mnc', count: 0 },
        { label: 'Product Company', value: 'product', count: 0 },
        { label: 'Service Company', value: 'service', count: 0 },
        { label: 'Non-Profit', value: 'non-profit', count: 0 },
        { label: 'Government', value: 'government', count: 0 },
      ];

      jobsData.forEach(job => {
        const companySize = job.company_size?.toLowerCase();
        const isGovJob = job.is_government_job || job.title?.toLowerCase().includes('government');
        
        const typeItem = companyTypeCounts.find(item => {
          if (item.value === 'government' && isGovJob) return true;
          if (item.value === 'startup' && companySize?.includes('startup')) return true;
          if (item.value === 'mnc' && companySize?.includes('large')) return true;
          return false;
        });
        if (typeItem) typeItem.count++;
      });

      // Work mode counts
      const workModeCounts = [
        { label: 'Work from Home', value: 'remote', count: 0 },
        { label: 'Hybrid', value: 'hybrid', count: 0 },
        { label: 'Work from Office', value: 'onsite', count: 0 },
      ];

      jobsData.forEach(job => {
        if (job.is_remote) {
          workModeCounts[0].count++;
        } else if (job.work_mode === 'hybrid') {
          workModeCounts[1].count++;
        } else {
          workModeCounts[2].count++;
        }
      });

      // Industry counts (from actual data)
      const industryMap = new Map<string, number>();
      jobsData.forEach(job => {
        if (job.industry) {
          const count = industryMap.get(job.industry) || 0;
          industryMap.set(job.industry, count + 1);
        }
      });

      const industryCounts = Array.from(industryMap.entries())
        .map(([industry, count]) => ({
          label: industry,
          value: industry.toLowerCase().replace(/\s+/g, '-'),
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Role category counts (from job titles)
      const roleCategoryMap = new Map<string, number>();
      jobsData.forEach(job => {
        // Extract category from job title
        const title = job.title?.toLowerCase() || '';
        if (title.includes('developer') || title.includes('engineer')) {
          const count = roleCategoryMap.get('Engineering') || 0;
          roleCategoryMap.set('Engineering', count + 1);
        } else if (title.includes('manager') || title.includes('lead')) {
          const count = roleCategoryMap.get('Management') || 0;
          roleCategoryMap.set('Management', count + 1);
        } else if (title.includes('sales')) {
          const count = roleCategoryMap.get('Sales') || 0;
          roleCategoryMap.set('Sales', count + 1);
        } else if (title.includes('marketing')) {
          const count = roleCategoryMap.get('Marketing') || 0;
          roleCategoryMap.set('Marketing', count + 1);
        }
      });

      const roleCategoryCounts = Array.from(roleCategoryMap.entries())
        .map(([category, count]) => ({
          label: category,
          value: category.toLowerCase().replace(/\s+/g, '-'),
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Education counts (from actual data)
      const educationMap = new Map<string, number>();
      jobsData.forEach(job => {
        if (job.educational_qualification) {
          const count = educationMap.get(job.educational_qualification) || 0;
          educationMap.set(job.educational_qualification, count + 1);
        } else if (job.education_level) {
          const count = educationMap.get(job.education_level) || 0;
          educationMap.set(job.education_level, count + 1);
        }
      });

      const educationCounts = Array.from(educationMap.entries())
        .map(([education, count]) => ({
          label: education,
          value: education.toLowerCase().replace(/\s+/g, '-'),
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Posted by counts
      const postedByCounts = [
        { label: 'Company', value: 'company', count: 0 },
        { label: 'Recruiter', value: 'recruiter', count: 0 },
        { label: 'Staffing Partner', value: 'staffing_partner', count: 0 },
        { label: 'HR Agency', value: 'hr_agency', count: 0 },
      ];

      jobsData.forEach(job => {
        const postedBy = job.posted_by_role || 'company';
        const postedItem = postedByCounts.find(item => item.value === postedBy);
        if (postedItem) postedItem.count++;
      });

      // Freshness counts
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const freshnessCounts = [
        { label: 'Last 24 hours', value: '1d', count: 0 },
        { label: 'Last 3 days', value: '3d', count: 0 },
        { label: 'Last week', value: '1w', count: 0 },
        { label: 'Last 2 weeks', value: '2w', count: 0 },
        { label: 'Last month', value: '1m', count: 0 },
      ];

      jobsData.forEach(job => {
        const postedDate = new Date(job.posted_at || job.created_at);
        if (postedDate >= oneDayAgo) {
          freshnessCounts[0].count++;
        } else if (postedDate >= threeDaysAgo) {
          freshnessCounts[1].count++;
        } else if (postedDate >= oneWeekAgo) {
          freshnessCounts[2].count++;
        } else if (postedDate >= twoWeeksAgo) {
          freshnessCounts[3].count++;
        } else {
          freshnessCounts[4].count++;
        }
      });

      return {
        experience: experienceCounts,
        salary: salaryCounts,
        department: departmentCounts,
        companyType: companyTypeCounts,
        workMode: workModeCounts,
        industry: industryCounts,
        roleCategory: roleCategoryCounts,
        education: educationCounts,
        postedBy: postedByCounts,
        freshness: freshnessCounts,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};