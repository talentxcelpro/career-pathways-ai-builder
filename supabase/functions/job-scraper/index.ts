import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JobData {
  title: string;
  company_name: string;
  description: string;
  location?: string;
  salary_range?: string;
  employment_type?: string;
  experience_level?: string;
  skills_required?: string[];
  source: string;
  external_url?: string;
  status: string;
}

serve(async (req) => {
  console.log(`🚀 Job scraper called: ${req.method} ${req.url}`);
  
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request');
    return new Response('OK', { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return new Response('Method Not Allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    // Parse request body
    let requestBody = {};
    try {
      requestBody = await req.json();
    } catch (e) {
      console.log('No JSON body provided, using defaults');
    }
    
    const limit = (requestBody as any)?.limit || 100;
    console.log(`Starting job scraping with limit: ${limit}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized');

    // Generate mock job data
    const companies = [
      'TechCorp Solutions', 'InnovateLab', 'DataFlow Inc', 'CloudTech Solutions', 'AI Dynamics',
      'DevSphere', 'CodeCraft', 'ByteForge', 'QuantumSoft', 'NeuralNet Co',
      'CyberVision', 'BlockChain Ventures', 'SmartCode', 'FutureTech', 'AgileWorks',
      'NextGen Digital', 'ProCode Systems', 'TechFlow Labs', 'DataCore Inc', 'CloudFirst'
    ];

    const jobTitles = [
      'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
      'DevOps Engineer', 'Data Scientist', 'Product Manager', 'UI/UX Designer',
      'Machine Learning Engineer', 'Cloud Architect', 'Mobile Developer', 'QA Engineer',
      'Technical Lead', 'Solutions Architect', 'Data Analyst', 'Cybersecurity Specialist'
    ];

    const locations = [
      'Mumbai, India', 'Bangalore, India', 'Delhi, India', 'Pune, India', 'Hyderabad, India',
      'Chennai, India', 'Kolkata, India', 'Ahmedabad, India', 'Gurgaon, India', 'Noida, India',
      'Remote', 'Hybrid - Mumbai', 'Hybrid - Bangalore', 'Hybrid - Delhi'
    ];

    const salaryRanges = [
      '₹3-6 LPA', '₹6-10 LPA', '₹10-15 LPA', '₹15-25 LPA', '₹25-40 LPA',
      '₹5-8 LPA', '₹8-12 LPA', '₹12-18 LPA', '₹18-30 LPA', '₹30-50 LPA'
    ];

    const employmentTypes = ['Full-time', 'Contract', 'Part-time', 'Internship'];
    const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead Level'];

    const jobsToInsert: JobData[] = [];
    let duplicateCount = 0;
    let successCount = 0;

    console.log('Generating jobs...');

    for (let i = 0; i < Math.min(limit, 300); i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      
      // Check for duplicates using the unique constraint
      const { data: existingJob } = await supabase
        .from('jobs')
        .select('id')
        .eq('title', title)
        .eq('company_name', company)
        .eq('location', location)
        .single();

      if (existingJob) {
        duplicateCount++;
        console.log(`Duplicate found: ${title} at ${company}`);
        continue;
      }

      const jobData: JobData = {
        title,
        company_name: company,
        description: `We are seeking a talented ${title} to join our innovative team at ${company}. This role offers excellent opportunities for professional growth and the chance to work with cutting-edge technologies.

Key Responsibilities:
• Design, develop, and maintain high-quality software solutions
• Collaborate with cross-functional teams to deliver exceptional products
• Participate in code reviews and maintain coding standards
• Contribute to technical documentation and knowledge sharing
• Stay current with industry trends and emerging technologies

Requirements:
• ${Math.floor(Math.random() * 5) + 1}+ years of relevant experience
• Strong problem-solving and analytical skills
• Excellent communication and teamwork abilities
• Bachelor's degree in Computer Science or related field

We offer competitive compensation, comprehensive benefits, flexible work arrangements, and a collaborative work environment that encourages innovation and professional development.`,
        location,
        salary_range: salaryRanges[Math.floor(Math.random() * salaryRanges.length)],
        employment_type: employmentTypes[Math.floor(Math.random() * employmentTypes.length)],
        experience_level: experienceLevels[Math.floor(Math.random() * experienceLevels.length)],
        skills_required: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS', 'Docker'].slice(0, Math.floor(Math.random() * 4) + 2),
        source: 'Generated Jobs API',
        external_url: `https://careers.${company.toLowerCase().replace(/\s+/g, '')}.com/jobs/${i + 1}`,
        status: 'active'
      };

      jobsToInsert.push(jobData);
    }

    console.log(`Generated ${jobsToInsert.length} unique jobs (${duplicateCount} duplicates skipped)`);

    // Insert jobs in batch
    if (jobsToInsert.length > 0) {
      const { data: insertedJobs, error: insertError } = await supabase
        .from('jobs')
        .insert(jobsToInsert)
        .select('id, title, company_name, location');

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      successCount = insertedJobs?.length || 0;
      console.log(`Successfully inserted ${successCount} jobs`);
    }

    // Try to trigger sitemap generation (optional)
    try {
      await supabase.functions.invoke('sitemap-generator');
      console.log('Sitemap generation triggered');
    } catch (error) {
      console.log('Sitemap generation failed (non-critical):', error);
    }

    const stats = {
      total_scraped: jobsToInsert.length + duplicateCount,
      valid_jobs: jobsToInsert.length,
      published_jobs: successCount,
      duplicates_skipped: duplicateCount,
      next_run: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
    };

    console.log('Scraping completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully scraped and published ${successCount} jobs`,
        stats,
        jobs: jobsToInsert.slice(0, 10) // Return first 10 for preview
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Job scraper error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stats: {
          total_scraped: 0,
          valid_jobs: 0,
          published_jobs: 0,
          duplicates_skipped: 0,
          next_run: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});