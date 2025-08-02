import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SEOPage {
  url: string
  title: string
  description: string
  keywords: string[]
  content: string
  priority: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'seed'

    if (action === 'seed') {
      await seedSEOPages(supabase)
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'SEO pages seeded successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'generate') {
      const count = parseInt(url.searchParams.get('count') || '100')
      const pages = await generateSEOPages(supabase, count)
      return new Response(JSON.stringify({ 
        success: true, 
        pages: pages.length,
        message: `Generated ${pages.length} SEO pages` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('SEO page seeder error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      details: error.message 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function seedSEOPages(supabase: any) {
  console.log('Starting SEO page seeding...')

  // Clear existing SEO cache
  await supabase.from('seo_content_cache').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const cities = [
    'Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai', 
    'Kolkata', 'Ahmedabad', 'Noida', 'Gurgaon', 'Kochi', 'Coimbatore',
    'Jaipur', 'Lucknow', 'Indore', 'Nagpur', 'Bhopal', 'Visakhapatnam'
  ]
  
  const roles = [
    'Software Engineer', 'Data Scientist', 'Product Manager', 'UI/UX Designer',
    'Business Analyst', 'Marketing Manager', 'Sales Manager', 'HR Manager',
    'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
    'DevOps Engineer', 'QA Engineer', 'Project Manager', 'Scrum Master',
    'Tech Lead', 'Solution Architect', 'Database Administrator'
  ]

  const skills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS',
    'Machine Learning', 'Digital Marketing', 'Data Analysis', 'Figma',
    'Adobe Photoshop', 'Excel', 'PowerBI', 'Salesforce', 'Docker',
    'Kubernetes', 'MongoDB', 'PostgreSQL', 'Git'
  ]

  const companies = [
    'TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra', 'Cognizant',
    'Microsoft', 'Google', 'Amazon', 'Flipkart', 'Paytm', 'Zomato',
    'Swiggy', 'Ola', 'Uber', 'Byju\'s', 'Unacademy', 'PhonePe'
  ]

  const pages: SEOPage[] = []

  // Generate job location pages
  cities.forEach(city => {
    pages.push(generateJobLocationPage(city))
    
    // Generate role-specific location pages
    roles.slice(0, 8).forEach(role => {
      pages.push(generateJobLocationRolePage(city, role))
    })
  })

  // Generate job role pages
  roles.forEach(role => {
    pages.push(generateJobRolePage(role))
  })

  // Generate skill guide pages
  skills.forEach(skill => {
    pages.push(generateSkillGuidePage(skill))
  })

  // Generate company location pages
  companies.forEach(company => {
    cities.slice(0, 6).forEach(city => {
      pages.push(generateCompanyLocationPage(company, city))
    })
  })

  // Generate career path pages
  roles.forEach(role => {
    pages.push(generateCareerPathPage(role))
  })

  // Store in cache
  const cacheEntries = pages.map(page => ({
    cache_key: `seo_page_${page.url.replace(/[^a-zA-Z0-9]/g, '_')}`,
    content_type: 'seo_page',
    content_data: page,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  }))

  // Insert in batches of 100
  for (let i = 0; i < cacheEntries.length; i += 100) {
    const batch = cacheEntries.slice(i, i + 100)
    const { error } = await supabase
      .from('seo_content_cache')
      .insert(batch)
    
    if (error) {
      console.error('Error inserting SEO cache batch:', error)
    }
  }

  console.log(`Seeded ${pages.length} SEO pages`)
  return pages
}

async function generateSEOPages(supabase: any, count: number) {
  // Fetch real data for more dynamic content
  const { data: jobs } = await supabase
    .from('jobs')
    .select('title, company_name, location')
    .eq('status', 'active')
    .limit(50)

  const { data: companies } = await supabase
    .from('companies')
    .select('name, location, industry')
    .limit(30)

  const pages: SEOPage[] = []
  
  // Generate dynamic pages based on real data
  jobs?.forEach((job, index) => {
    if (index < count / 2) {
      pages.push(generateDynamicJobPage(job))
    }
  })

  companies?.forEach((company, index) => {
    if (index < count / 4) {
      pages.push(generateDynamicCompanyPage(company))
    }
  })

  return pages.slice(0, count)
}

function generateJobLocationPage(city: string): SEOPage {
  return {
    url: `/jobs/location/${city.toLowerCase().replace(/\s+/g, '-')}`,
    title: `Jobs in ${city} 2025 | Find Best Career Opportunities | TalentXcel`,
    description: `Discover amazing job opportunities in ${city}. Browse latest openings, competitive salaries, and top companies hiring in ${city}. Apply today on TalentXcel.`,
    keywords: [`jobs in ${city}`, `${city} careers`, `${city} employment`, 'job search', 'career opportunities'],
    content: generateJobLocationContent(city),
    priority: 0.8
  }
}

function generateJobLocationRolePage(city: string, role: string): SEOPage {
  return {
    url: `/jobs/location/${city.toLowerCase().replace(/\s+/g, '-')}/${role.toLowerCase().replace(/\s+/g, '-')}`,
    title: `${role} Jobs in ${city} | Latest Openings 2025 | TalentXcel`,
    description: `Find ${role} positions in ${city}. Top companies hiring ${role} professionals with competitive packages. Apply now on TalentXcel.`,
    keywords: [`${role} jobs ${city}`, `${role} careers ${city}`, `${role} opportunities`, 'job search'],
    content: generateJobLocationRoleContent(city, role),
    priority: 0.7
  }
}

function generateJobRolePage(role: string): SEOPage {
  return {
    url: `/jobs/role/${role.toLowerCase().replace(/\s+/g, '-')}`,
    title: `${role} Jobs & Career Guide 2025 | Skills, Salary & Growth | TalentXcel`,
    description: `Complete ${role} career guide. Explore job opportunities, required skills, salary ranges, and career progression for ${role} professionals.`,
    keywords: [`${role} jobs`, `${role} career`, `${role} salary`, `${role} skills`, 'career development'],
    content: generateJobRoleContent(role),
    priority: 0.8
  }
}

function generateSkillGuidePage(skill: string): SEOPage {
  return {
    url: `/skills/${skill.toLowerCase().replace(/\s+/g, '-')}`,
    title: `${skill} Skills Guide 2025 | Learn, Master & Advance Your Career | TalentXcel`,
    description: `Master ${skill} skills with our comprehensive guide. Learn ${skill}, find courses, certifications, and job opportunities requiring ${skill} expertise.`,
    keywords: [`${skill} skills`, `learn ${skill}`, `${skill} courses`, `${skill} certification`, 'skill development'],
    content: generateSkillGuideContent(skill),
    priority: 0.6
  }
}

function generateCompanyLocationPage(company: string, city: string): SEOPage {
  return {
    url: `/companies/${company.toLowerCase().replace(/\s+/g, '-')}/${city.toLowerCase().replace(/\s+/g, '-')}`,
    title: `${company} Jobs in ${city} | Company Profile & Careers | TalentXcel`,
    description: `Explore career opportunities at ${company} in ${city}. Learn about company culture, benefits, job openings, and application process.`,
    keywords: [`${company} jobs`, `${company} careers`, `${company} ${city}`, `jobs at ${company}`, 'company profile'],
    content: generateCompanyLocationContent(company, city),
    priority: 0.6
  }
}

function generateCareerPathPage(role: string): SEOPage {
  return {
    url: `/career-paths/${role.toLowerCase().replace(/\s+/g, '-')}`,
    title: `${role} Career Path 2025 | Roadmap, Skills & Salary Growth | TalentXcel`,
    description: `Explore the complete ${role} career path. Understand progression stages, required skills, salary growth, and how to advance your ${role} career.`,
    keywords: [`${role} career path`, `${role} progression`, `${role} roadmap`, 'career development', 'professional growth'],
    content: generateCareerPathContent(role),
    priority: 0.6
  }
}

function generateDynamicJobPage(job: any): SEOPage {
  const slug = `${job.title}-${job.company_name}-${job.location}`.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
  return {
    url: `/jobs/dynamic/${slug}`,
    title: `${job.title} at ${job.company_name} in ${job.location} | Apply Now | TalentXcel`,
    description: `Join ${job.company_name} as ${job.title} in ${job.location}. Excellent opportunity for career growth with competitive package. Apply now on TalentXcel.`,
    keywords: [`${job.title} jobs`, `${job.company_name} careers`, `jobs in ${job.location}`, 'job application'],
    content: generateDynamicJobContent(job),
    priority: 0.7
  }
}

function generateDynamicCompanyPage(company: any): SEOPage {
  const slug = company.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
  return {
    url: `/companies/profile/${slug}`,
    title: `${company.name} Jobs & Company Profile | Careers in ${company.industry} | TalentXcel`,
    description: `Explore career opportunities at ${company.name}. Leading ${company.industry} company offering exciting roles and growth opportunities.`,
    keywords: [`${company.name} jobs`, `${company.name} careers`, `${company.industry} jobs`, 'company profile'],
    content: generateDynamicCompanyContent(company),
    priority: 0.6
  }
}

// Content generation functions
function generateJobLocationContent(city: string): string {
  return `<div class="space-y-6">
    <p>Looking for job opportunities in ${city}? You've come to the right place. TalentXcel connects job seekers with top employers in ${city}, offering competitive salaries and excellent career growth opportunities.</p>
    
    <h2 class="text-2xl font-semibold mt-8 mb-4">Why Choose ${city} for Your Career?</h2>
    <p>${city} offers a thriving job market with opportunities across various industries. The city provides excellent infrastructure, networking opportunities, and a vibrant professional community.</p>
    
    <h2 class="text-2xl font-semibold mt-8 mb-4">Top Industries in ${city}</h2>
    <p>Major sectors in ${city} include technology, finance, healthcare, manufacturing, and services. These industries offer diverse career paths and growth opportunities for professionals.</p>
    
    <h2 class="text-2xl font-semibold mt-8 mb-4">Salary Expectations in ${city}</h2>
    <p>Professionals in ${city} can expect competitive salaries based on experience, skills, and industry. The cost of living and salary ranges make ${city} an attractive destination for career growth.</p>
  </div>`
}

function generateJobLocationRoleContent(city: string, role: string): string {
  return `<div class="space-y-6">
    <p>Explore ${role} opportunities in ${city}. Top companies are actively hiring ${role} professionals with competitive packages and excellent growth prospects.</p>
    
    <h2 class="text-2xl font-semibold mt-8 mb-4">${role} Market in ${city}</h2>
    <p>The ${role} job market in ${city} is thriving with numerous opportunities across startups, mid-size companies, and large enterprises. Companies value skilled ${role} professionals.</p>
    
    <h2 class="text-2xl font-semibold mt-8 mb-4">Skills in Demand</h2>
    <p>${role} professionals in ${city} should focus on developing both technical and soft skills. Industry-specific knowledge and experience are highly valued by employers.</p>
  </div>`
}

function generateJobRoleContent(role: string): string {
  return `<div class="space-y-6">
    <p>Comprehensive career guide for ${role} professionals. Explore job opportunities, required skills, salary ranges, and career progression paths.</p>
    
    <h2 class="text-2xl font-semibold mt-8 mb-4">What Does a ${role} Do?</h2>
    <p>A ${role} is responsible for various tasks that contribute to organizational success. The role involves strategic thinking, problem-solving, and collaboration with different teams.</p>
    
    <h2 class="text-2xl font-semibold mt-8 mb-4">Skills Required for ${role}</h2>
    <p>To excel as a ${role}, you need a combination of technical and soft skills. Key competencies include analytical thinking, communication, and domain expertise.</p>
  </div>`
}

function generateSkillGuideContent(skill: string): string {
  return `<div class="space-y-6">
    <p>Master ${skill} with our comprehensive guide. Learn how to develop ${skill} expertise, find relevant courses, and advance your career.</p>
    
    <h2 class="text-2xl font-semibold mt-8 mb-4">Why ${skill} Skills Matter</h2>
    <p>${skill} is a crucial skill in today's job market. Professionals with strong ${skill} capabilities are in high demand and can command higher salaries.</p>
    
    <h2 class="text-2xl font-semibold mt-8 mb-4">Learning Path for ${skill}</h2>
    <p>Building ${skill} expertise requires structured learning and practice. Start with fundamentals and gradually advance to complex applications.</p>
  </div>`
}

function generateCompanyLocationContent(company: string, city: string): string {
  return `<div class="space-y-6">
    <p>Discover career opportunities at ${company} in ${city}. Learn about company culture, available positions, and how to join this leading organization.</p>
    
    <h2 class="text-2xl font-semibold mt-8 mb-4">About ${company}</h2>
    <p>${company} is a leading organization known for innovation and employee development. The company offers excellent growth opportunities and benefits.</p>
    
    <h2 class="text-2xl font-semibold mt-8 mb-4">${company} ${city} Office</h2>
    <p>The ${city} office provides a modern work environment with excellent facilities and connectivity. Join a team of talented professionals.</p>
  </div>`
}

function generateCareerPathContent(role: string): string {
  return `<div class="space-y-6">
    <p>Navigate your ${role} career journey with our comprehensive career path guide. Understand progression stages and growth opportunities.</p>
    
    <h2 class="text-2xl font-semibold mt-8 mb-4">Career Stages for ${role}</h2>
    <p>The ${role} career path includes entry-level, mid-level, senior, and leadership positions. Each stage offers different responsibilities and growth opportunities.</p>
    
    <h2 class="text-2xl font-semibold mt-8 mb-4">Salary Progression</h2>
    <p>${role} professionals can expect salary growth as they advance. Compensation increases with experience, skills, and leadership responsibilities.</p>
  </div>`
}

function generateDynamicJobContent(job: any): string {
  return `<div class="space-y-6">
    <p>Exciting ${job.title} opportunity at ${job.company_name} in ${job.location}. Join a dynamic team and accelerate your career growth.</p>
    
    <h2 class="text-2xl font-semibold mt-8 mb-4">About the Role</h2>
    <p>This ${job.title} position offers excellent opportunities for professional development and career advancement at ${job.company_name}.</p>
    
    <h2 class="text-2xl font-semibold mt-8 mb-4">Why Join ${job.company_name}?</h2>
    <p>${job.company_name} offers competitive benefits, growth opportunities, and a collaborative work environment in ${job.location}.</p>
  </div>`
}

function generateDynamicCompanyContent(company: any): string {
  return `<div class="space-y-6">
    <p>Explore career opportunities at ${company.name}, a leading ${company.industry} company offering exciting roles and professional growth.</p>
    
    <h2 class="text-2xl font-semibold mt-8 mb-4">About ${company.name}</h2>
    <p>${company.name} is a renowned organization in the ${company.industry} sector, known for innovation and employee development.</p>
    
    <h2 class="text-2xl font-semibold mt-8 mb-4">Career Opportunities</h2>
    <p>Join ${company.name} and be part of a team that values talent, innovation, and professional growth in the ${company.industry} industry.</p>
  </div>`
}