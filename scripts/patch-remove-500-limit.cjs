const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'src', 'components', 'products', 'JobMatchProduct.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Update fetchJobs to fetch all jobs in batches rather than .limit(500)
const fetchTarget = `      // 2. Fetch authentic active vacancies directly from Supabase
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, company_name, location, location_city, location_state, employment_type, is_remote, work_mode, salary_min, salary_max, salary_currency, applicant_location_requirements, description, department, industry, external_url, skills_required, application_deadline, expires_at, created_at, job_summary, min_experience, max_experience, is_featured, views_count, applications_count, experience_level')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Supabase jobs fetch error:', error);
        setErrorState(error.message || 'Unable to connect to live jobs database');
        setJobs([]);
        return;
      }

      const now = new Date();
      const unexpired = (data || []).filter(j => {
        if (j.application_deadline && new Date(j.application_deadline) < now) return false;
        if (j.expires_at && new Date(j.expires_at) < now) return false;
        return true;
      });

      setJobs(unexpired as any);`;

const fetchReplacement = `      // 2. Fetch ALL authentic active vacancies directly from Supabase via parallel range batches
      const FIELDS = 'id, title, company_name, location, location_city, location_state, employment_type, is_remote, work_mode, salary_min, salary_max, salary_currency, applicant_location_requirements, description, department, industry, external_url, skills_required, application_deadline, expires_at, created_at, job_summary, min_experience, max_experience, is_featured, views_count, applications_count, experience_level';
      const totalActive = (count && count > 0) ? count : 2500;
      const batchCount = Math.ceil(totalActive / 1000);
      const batchPromises = [];
      for (let i = 0; i < batchCount; i++) {
        batchPromises.push(
          supabase
            .from('jobs')
            .select(FIELDS)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .range(i * 1000, (i + 1) * 1000 - 1)
        );
      }

      const results = await Promise.all(batchPromises);
      let allData: any[] = [];
      let fetchError: any = null;
      for (const res of results) {
        if (res.error) {
          fetchError = res.error;
          console.error('Supabase jobs fetch error:', res.error);
        }
        if (res.data) {
          allData = allData.concat(res.data);
        }
      }

      if (fetchError && allData.length === 0) {
        setErrorState(fetchError.message || 'Unable to connect to live jobs database');
        setJobs([]);
        return;
      }

      const now = new Date();
      const unexpired = allData.filter(j => {
        if (j.application_deadline && new Date(j.application_deadline) < now) return false;
        if (j.expires_at && new Date(j.expires_at) < now) return false;
        return true;
      });

      setJobs(unexpired as any);
      setTotalCount(unexpired.length);`;

const normContent = content.replace(/\r\n/g, '\n');
const normFetchTarget = fetchTarget.replace(/\r\n/g, '\n');
const normFetchReplacement = fetchReplacement.replace(/\r\n/g, '\n');

if (normContent.includes(normFetchTarget)) {
  const isCRLF = content.includes('\r\n');
  const finalReplacement = isCRLF ? fetchReplacement.replace(/\n/g, '\r\n') : normFetchReplacement;
  const finalTarget = isCRLF ? fetchTarget.replace(/\n/g, '\r\n') : normFetchTarget;
  content = content.replace(finalTarget, finalReplacement);
  console.log('✅ Updated fetchJobs to load all jobs without 500 limit');
} else {
  console.error('❌ Could not find fetchTarget');
}

fs.writeFileSync(targetFile, content, 'utf8');
