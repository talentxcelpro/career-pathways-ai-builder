import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const sitemapType = url.searchParams.get('type');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = 50000; // Max URLs per sitemap

    let sitemapContent = '';

    switch (sitemapType) {
      case 'jobs-by-location':
        sitemapContent = await generateJobsByLocationSitemap(supabase, page, limit);
        break;
      case 'jobs-by-skill':
        sitemapContent = await generateJobsBySkillSitemap(supabase, page, limit);
        break;
      case 'jobs-by-role':
        sitemapContent = await generateJobsByRoleSitemap(supabase, page, limit);
        break;
      case 'companies-by-location':
        sitemapContent = await generateCompaniesByLocationSitemap(supabase, page, limit);
        break;
      case 'salary-ranges':
        sitemapContent = await generateSalaryRangesSitemap(supabase);
        break;
      case 'dynamic-combinations':
        sitemapContent = await generateDynamicCombinationsSitemap(supabase, page, limit);
        break;
      default:
        sitemapContent = await generateMainJobsSitemap(supabase, page, limit);
    }

    return new Response(sitemapContent, {
      headers: corsHeaders,
    });

  } catch (error: any) {
    console.error('Error generating sitemap:', error);
    return new Response(`Error: ${error?.message || 'Unknown error'}`, {
      status: 500,
      headers: corsHeaders,
    });
  }
});

async function generateMainJobsSitemap(supabase: any, page: number, limit: number) {
  const offset = (page - 1) * limit;
  
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, seo_slug, created_at, updated_at')
    .eq('is_active', true)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
`;

  jobs?.forEach((job: any) => {
    const lastmod = job.updated_at || job.created_at;
    xml += `
  <url>
    <loc>https://talentxcel.in/jobs/${job.seo_slug || job.id}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  xml += `
</urlset>`;
  return xml;
}

async function generateJobsByLocationSitemap(supabase: any, page: number, limit: number) {
  // Indian cities and locations for comprehensive coverage
  const locations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
    'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
    'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
    'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar',
    'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad',
    'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur',
    'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubballi-Dharwad',
    'Tiruchirappalli', 'Bareilly', 'Mysore', 'Tiruppur', 'Gurgaon', 'Aligarh', 'Jalandhar'
  ];

  const roles = [
    'Software Engineer', 'Data Scientist', 'Product Manager', 'Business Analyst',
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer',
    'UI/UX Designer', 'Marketing Manager', 'Sales Executive', 'HR Manager'
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  const startIndex = (page - 1) * limit;
  let count = 0;

  for (const location of locations) {
    if (count >= limit) break;
    
    // Location main page
    if (count >= startIndex) {
      xml += `
  <url>
    <loc>https://talentxcel.in/jobs/location/${encodeURIComponent(location.toLowerCase().replace(/\s+/g, '-'))}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
    }
    count++;

    // Location + Role combinations
    for (const role of roles) {
      if (count >= startIndex + limit) break;
      if (count >= startIndex) {
        const roleSlug = role.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const locationSlug = location.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        xml += `
  <url>
    <loc>https://talentxcel.in/jobs/${roleSlug}/in/${locationSlug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
      count++;
    }
  }

  xml += `
</urlset>`;
  return xml;
}

async function generateJobsBySkillSitemap(supabase: any, page: number, limit: number) {
  const techSkills = [
    'React', 'Angular', 'Vue.js', 'Node.js', 'Python', 'Java', 'JavaScript', 'TypeScript',
    'PHP', 'Laravel', 'Django', 'Flask', 'Spring Boot', 'Express.js', 'MongoDB', 'MySQL',
    'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Jenkins',
    'Git', 'Linux', 'Apache', 'Nginx', 'Elasticsearch', 'RabbitMQ', 'Kafka', 'GraphQL',
    'REST API', 'Microservices', 'Machine Learning', 'AI', 'TensorFlow', 'PyTorch',
    'Data Science', 'Big Data', 'Hadoop', 'Spark', 'Tableau', 'Power BI', 'SQL',
    'NoSQL', 'DevOps', 'CI/CD', 'Agile', 'Scrum', 'JIRA', 'Confluence', 'Salesforce'
  ];

  const businessSkills = [
    'Project Management', 'Digital Marketing', 'SEO', 'SEM', 'Content Marketing',
    'Social Media Marketing', 'Email Marketing', 'Lead Generation', 'CRM', 'Sales',
    'Business Development', 'Account Management', 'Customer Success', 'HR',
    'Recruitment', 'Training', 'Finance', 'Accounting', 'Operations', 'Supply Chain'
  ];

  const allSkills = [...techSkills, ...businessSkills];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  const startIndex = (page - 1) * limit;
  let count = 0;

  for (const skill of allSkills) {
    if (count >= startIndex + limit) break;
    if (count >= startIndex) {
      const skillSlug = skill.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      xml += `
  <url>
    <loc>https://talentxcel.in/jobs/skill/${skillSlug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    }
    count++;
  }

  xml += `
</urlset>`;
  return xml;
}

async function generateJobsByRoleSitemap(supabase: any, page: number, limit: number) {
  const roles = [
    // Technology Roles
    'Software Engineer', 'Senior Software Engineer', 'Lead Software Engineer', 'Staff Software Engineer',
    'Frontend Developer', 'Senior Frontend Developer', 'Lead Frontend Developer',
    'Backend Developer', 'Senior Backend Developer', 'Lead Backend Developer',
    'Full Stack Developer', 'Senior Full Stack Developer', 'Lead Full Stack Developer',
    'Mobile Developer', 'iOS Developer', 'Android Developer', 'React Native Developer',
    'DevOps Engineer', 'Senior DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer',
    'Data Engineer', 'Senior Data Engineer', 'Data Scientist', 'Senior Data Scientist',
    'Machine Learning Engineer', 'AI Engineer', 'Research Scientist',
    'Product Manager', 'Senior Product Manager', 'Principal Product Manager',
    'Technical Product Manager', 'Product Owner', 'Program Manager',
    'Engineering Manager', 'Technical Lead', 'Architect', 'Principal Engineer',
    'CTO', 'VP Engineering', 'Director of Engineering',
    
    // Design Roles
    'UI Designer', 'UX Designer', 'UI/UX Designer', 'Product Designer',
    'Senior UI/UX Designer', 'Lead Designer', 'Design Director',
    'Visual Designer', 'Graphic Designer', 'Web Designer',
    
    // Business Roles
    'Business Analyst', 'Senior Business Analyst', 'Lead Business Analyst',
    'Data Analyst', 'Senior Data Analyst', 'Business Intelligence Analyst',
    'Financial Analyst', 'Senior Financial Analyst', 'Investment Analyst',
    'Marketing Manager', 'Senior Marketing Manager', 'Digital Marketing Manager',
    'Content Marketing Manager', 'SEO Specialist', 'SEM Specialist',
    'Social Media Manager', 'Brand Manager', 'Growth Manager',
    'Sales Manager', 'Senior Sales Manager', 'Sales Director',
    'Business Development Manager', 'Account Manager', 'Customer Success Manager',
    
    // Operations Roles
    'Operations Manager', 'Senior Operations Manager', 'Operations Director',
    'Supply Chain Manager', 'Logistics Manager', 'Quality Assurance Manager',
    'Project Manager', 'Senior Project Manager', 'Program Manager',
    'Scrum Master', 'Agile Coach', 'Delivery Manager',
    
    // HR & Admin Roles
    'HR Manager', 'Senior HR Manager', 'HR Business Partner',
    'Recruiter', 'Senior Recruiter', 'Talent Acquisition Manager',
    'Training Manager', 'Learning & Development Manager',
    'Admin Manager', 'Office Manager', 'Executive Assistant'
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  const startIndex = (page - 1) * limit;
  let count = 0;

  for (const role of roles) {
    if (count >= startIndex + limit) break;
    if (count >= startIndex) {
      const roleSlug = role.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      xml += `
  <url>
    <loc>https://talentxcel.in/jobs/role/${roleSlug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    }
    count++;
  }

  xml += `
</urlset>`;
  return xml;
}

async function generateCompaniesByLocationSitemap(supabase: any, page: number, limit: number) {
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, slug, location, industry')
    .eq('is_active', true)
    .limit(1000);

  const locations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  const startIndex = (page - 1) * limit;
  let count = 0;

  for (const location of locations) {
    if (count >= startIndex + limit) break;
    if (count >= startIndex) {
      const locationSlug = location.toLowerCase().replace(/\s+/g, '-');
      xml += `
  <url>
    <loc>https://talentxcel.in/companies/location/${locationSlug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }
    count++;
  }

  companies?.forEach((company: any) => {
    if (count >= startIndex + limit) return;
    if (count >= startIndex) {
      xml += `
  <url>
    <loc>https://talentxcel.in/companies/${company.slug || company.id}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }
    count++;
  });

  xml += `
</urlset>`;
  return xml;
}

async function generateSalaryRangesSitemap(supabase: any) {
  const salaryRanges = [
    '0-3-lakh', '3-5-lakh', '5-8-lakh', '8-12-lakh', '12-18-lakh', 
    '18-25-lakh', '25-40-lakh', '40-60-lakh', '60-lakh-plus'
  ];

  const roles = [
    'software-engineer', 'data-scientist', 'product-manager', 'business-analyst',
    'frontend-developer', 'backend-developer', 'devops-engineer', 'ui-ux-designer'
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  // Salary range pages
  for (const range of salaryRanges) {
    xml += `
  <url>
    <loc>https://talentxcel.in/salary/range/${range}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;

    // Role + Salary combinations
    for (const role of roles) {
      xml += `
  <url>
    <loc>https://talentxcel.in/salary/${role}/${range}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }
  }

  xml += `
</urlset>`;
  return xml;
}

async function generateDynamicCombinationsSitemap(supabase: any, page: number, limit: number) {
  const technologies = ['react', 'angular', 'vue', 'node-js', 'python', 'java', 'javascript'];
  const experiences = ['fresher', '1-3-years', '3-5-years', '5-8-years', '8-plus-years'];
  const jobTypes = ['full-time', 'part-time', 'contract', 'internship', 'remote'];
  const locations = ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'pune'];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  const startIndex = (page - 1) * limit;
  let count = 0;

  // Generate combinations
  for (const tech of technologies) {
    for (const exp of experiences) {
      for (const location of locations) {
        if (count >= startIndex + limit) break;
        if (count >= startIndex) {
          xml += `
  <url>
    <loc>https://talentxcel.in/jobs/${tech}/${exp}/in/${location}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
  </url>`;
        }
        count++;
      }
    }
  }

  xml += `
</urlset>`;
  return xml;
}