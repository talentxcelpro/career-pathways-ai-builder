const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/components/products/jobmatch/InternationalJobLandingPage.tsx');
let c = fs.readFileSync(file, 'utf8');

const oldBlock = `      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, company_name, location, location_city, location_state, employment_type, is_remote, work_mode, salary_min, salary_max, salary_currency, applicant_location_requirements, description, department, industry, external_url, skills_required, application_deadline, expires_at, created_at, job_summary, min_experience, max_experience')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(300);`;

const newBlock = `      let query = supabase
        .from('jobs')
        .select('id, title, company_name, location, location_city, location_state, employment_type, is_remote, work_mode, salary_min, salary_max, salary_currency, applicant_location_requirements, description, department, industry, external_url, skills_required, application_deadline, expires_at, created_at, job_summary, min_experience, max_experience, structured_data')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (hubConfig.searchFilter.cityMatch) {
        query = query.ilike('location', \`%\${hubConfig.searchFilter.cityMatch}%\`);
      } else if (hubConfig.countryCode === 'US') {
        query = query.or('location.ilike.%United States%,location.ilike.%USA%,location.ilike.%Austin%,location.ilike.%Seattle%,location.ilike.%New York%,location.ilike.%San Francisco%,is_remote.eq.true');
      } else if (hubConfig.searchFilter.countryMatch) {
        query = query.ilike('location', \`%\${hubConfig.searchFilter.countryMatch}%\`);
      }

      const { data, error } = await query.limit(100);`;

c = c.replace(oldBlock.replace(/\r\n/g, '\n'), newBlock.replace(/\r\n/g, '\n'));
c = c.replace(oldBlock.replace(/\n/g, '\r\n'), newBlock.replace(/\n/g, '\r\n'));

fs.writeFileSync(file, c, 'utf8');
console.log('✓ Successfully updated fetchHubJobs in InternationalJobLandingPage.tsx');
