import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JobTemplate {
  title: string;
  company: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_min?: number;
  salary_max?: number;
  skills: string[];
  description: string;
  industry: string;
  department: string;
}

const jobTemplates: JobTemplate[] = [
  {
    title: "Senior Frontend Developer",
    company: "TechCorp India",
    location: "Bangalore, Karnataka",
    employment_type: "Full-time",
    experience_level: "senior-level",
    salary_min: 1200000,
    salary_max: 2000000,
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    description: "We are looking for a Senior Frontend Developer to join our growing team. You will be responsible for building user-facing features using modern web technologies. The ideal candidate has 5+ years of experience with React and TypeScript.",
    industry: "Technology",
    department: "engineering"
  },
  {
    title: "Data Scientist",
    company: "Analytics Pro",
    location: "Mumbai, Maharashtra",
    employment_type: "Full-time",
    experience_level: "mid-level",
    salary_min: 800000,
    salary_max: 1500000,
    skills: ["Python", "Machine Learning", "SQL", "Pandas"],
    description: "Join our data science team to analyze complex datasets and build predictive models. Experience with Python, machine learning libraries, and statistical analysis required.",
    industry: "Technology",
    department: "engineering"
  },
  {
    title: "Digital Marketing Manager",
    company: "Growth Agency",
    location: "Delhi, Delhi",
    employment_type: "Full-time",
    experience_level: "mid-level",
    salary_min: 600000,
    salary_max: 1000000,
    skills: ["Digital Marketing", "SEO", "Google Ads", "Analytics"],
    description: "Lead our digital marketing initiatives including SEO, SEM, social media marketing, and content strategy. 3-5 years of experience in digital marketing required.",
    industry: "Marketing",
    department: "marketing"
  },
  {
    title: "Backend Engineer",
    company: "StartupXYZ",
    location: "Hyderabad, Telangana",
    employment_type: "Full-time",
    experience_level: "junior",
    salary_min: 500000,
    salary_max: 900000,
    skills: ["Node.js", "Express", "MongoDB", "AWS"],
    description: "Build scalable backend services and APIs. Work with modern technologies including Node.js, Express, and cloud platforms. Great opportunity for growth.",
    industry: "Technology",
    department: "engineering"
  },
  {
    title: "Product Manager",
    company: "InnovateNow",
    location: "Pune, Maharashtra",
    employment_type: "Full-time",
    experience_level: "senior-level",
    salary_min: 1500000,
    salary_max: 2500000,
    skills: ["Product Management", "Agile", "Analytics", "User Research"],
    description: "Drive product strategy and roadmap for our flagship products. Collaborate with engineering, design, and business teams to deliver exceptional user experiences.",
    industry: "Technology",
    department: "product"
  },
  {
    title: "UI/UX Designer",
    company: "DesignStudio",
    location: "Bangalore, Karnataka",
    employment_type: "Full-time",
    experience_level: "mid-level",
    salary_min: 700000,
    salary_max: 1200000,
    skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
    description: "Create beautiful and intuitive user interfaces for web and mobile applications. Strong portfolio and experience with design tools required.",
    industry: "Technology",
    department: "design"
  },
  {
    title: "DevOps Engineer",
    company: "CloudTech Solutions",
    location: "Chennai, Tamil Nadu",
    employment_type: "Full-time",
    experience_level: "mid-level",
    salary_min: 900000,
    salary_max: 1600000,
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
    description: "Manage cloud infrastructure and deployment pipelines. Experience with AWS, containerization, and automation tools essential.",
    industry: "Technology",
    department: "operations"
  },
  {
    title: "Sales Executive",
    company: "SalesForce India",
    location: "Mumbai, Maharashtra",
    employment_type: "Full-time",
    experience_level: "junior",
    salary_min: 400000,
    salary_max: 800000,
    skills: ["Sales", "CRM", "Communication", "Lead Generation"],
    description: "Drive sales growth by identifying new business opportunities and maintaining client relationships. Strong communication skills and sales experience preferred.",
    industry: "Sales",
    department: "sales"
  },
  {
    title: "Full Stack Developer",
    company: "WebDev Solutions",
    location: "Noida, Uttar Pradesh",
    employment_type: "Full-time",
    experience_level: "mid-level",
    salary_min: 800000,
    salary_max: 1400000,
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript"],
    description: "Work on both frontend and backend development. Build complete web applications using modern JavaScript frameworks and databases.",
    industry: "Technology",
    department: "engineering"
  },
  {
    title: "HR Manager",
    company: "PeopleFirst Corp",
    location: "Gurgaon, Haryana",
    employment_type: "Full-time",
    experience_level: "senior-level",
    salary_min: 1000000,
    salary_max: 1800000,
    skills: ["HR Management", "Recruitment", "Employee Relations", "HRIS"],
    description: "Lead HR initiatives including recruitment, employee engagement, and performance management. 5+ years of HR experience required.",
    industry: "Human Resources",
    department: "hr"
  }
]

const additionalCompanies = [
  "Microsoft India", "Google India", "Amazon India", "Flipkart", "Zomato", "Swiggy", "Paytm", "BYJU'S", 
  "Ola", "Uber India", "Infosys", "TCS", "Wipro", "HCL Technologies", "Tech Mahindra", "Mindtree",
  "Freshworks", "Zoho", "Razorpay", "PhonePe", "Nykaa", "BigBasket", "MakeMyTrip", "BookMyShow"
]

const cities = [
  "Bangalore, Karnataka", "Mumbai, Maharashtra", "Delhi, Delhi", "Hyderabad, Telangana", 
  "Pune, Maharashtra", "Chennai, Tamil Nadu", "Kolkata, West Bengal", "Ahmedabad, Gujarat",
  "Jaipur, Rajasthan", "Kochi, Kerala", "Indore, Madhya Pradesh", "Noida, Uttar Pradesh",
  "Gurgaon, Haryana", "Chandigarh, Punjab", "Bhubaneswar, Odisha", "Coimbatore, Tamil Nadu"
]

function generateRandomJob(): JobTemplate {
  const baseJob = jobTemplates[Math.floor(Math.random() * jobTemplates.length)]
  
  // Randomly modify some aspects
  const companies = [...additionalCompanies, baseJob.company]
  const randomCompany = companies[Math.floor(Math.random() * companies.length)]
  const randomLocation = cities[Math.floor(Math.random() * cities.length)]
  
  // Add some salary variation
  const salaryMultiplier = 0.8 + Math.random() * 0.4 // 0.8 to 1.2
  
  return {
    ...baseJob,
    company: randomCompany,
    location: randomLocation,
    salary_min: baseJob.salary_min ? Math.floor(baseJob.salary_min * salaryMultiplier) : undefined,
    salary_max: baseJob.salary_max ? Math.floor(baseJob.salary_max * salaryMultiplier) : undefined,
  }
}

function generateSEOSlug(title: string, company: string, location: string): string {
  const cleanText = (text: string) => text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  
  const titleSlug = cleanText(title)
  const companySlug = cleanText(company)
  const locationSlug = cleanText(location)
  
  return `${titleSlug}-${companySlug}-${locationSlug}`.substring(0, 100)
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { count = 10 } = await req.json()
    
    console.log(`Generating ${count} realistic jobs...`)

    const jobsToInsert = []
    
    for (let i = 0; i < count; i++) {
      const jobData = generateRandomJob()
      
      const job = {
        title: jobData.title,
        description: jobData.description,
        company_name: jobData.company,
        location: jobData.location,
        salary_min: jobData.salary_min,
        salary_max: jobData.salary_max,
        salary_range: jobData.salary_min && jobData.salary_max 
          ? `₹${(jobData.salary_min/100000).toFixed(0)}-${(jobData.salary_max/100000).toFixed(0)} LPA`
          : 'Not disclosed',
        employment_type: jobData.employment_type,
        experience_level: jobData.experience_level,
        skills_required: jobData.skills,
        is_remote: Math.random() > 0.7, // 30% chance of remote
        is_featured: Math.random() > 0.9, // 10% chance of featured
        job_status: 'open',
        is_active: true,
        posted_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last week
        expires_at: new Date(Date.now() + (30 + Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(), // Expires in 30-60 days
        seo_slug: generateSEOSlug(jobData.title, jobData.company, jobData.location),
        views_count: Math.floor(Math.random() * 100),
        applications_count: Math.floor(Math.random() * 20),
        industry: jobData.industry,
        department: jobData.department,
        job_type: 'external',
        external_url: `https://careers.${jobData.company.toLowerCase().replace(/\s+/g, '')}.com/jobs/${Math.random().toString(36).substring(7)}`,
        posted_by: '00000000-0000-0000-0000-000000000000' // System user
      }
      
      jobsToInsert.push(job)
    }

    // Insert jobs in batches
    const { data, error } = await supabaseClient
      .from('jobs')
      .insert(jobsToInsert)
      .select('id, title, company_name')

    if (error) {
      console.error('Error inserting jobs:', error)
      throw error
    }

    console.log(`Successfully generated ${data?.length || 0} jobs`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully generated ${data?.length || 0} realistic jobs`,
        jobs: data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in generate-realistic-jobs:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})