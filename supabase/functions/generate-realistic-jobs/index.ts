import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Starting realistic job generation...');

    // Industry distribution with realistic job counts
    const industries = [
      { name: 'IT / Software', count: 80, domain: 'technology' },
      { name: 'Banking / Finance', count: 50, domain: 'finance' },
      { name: 'Healthcare', count: 40, domain: 'healthcare' },
      { name: 'Education', count: 35, domain: 'education' },
      { name: 'Marketing / Advertising', count: 30, domain: 'marketing' },
      { name: 'Manufacturing', count: 35, domain: 'manufacturing' },
      { name: 'FMCG / Retail', count: 30, domain: 'retail' },
      { name: 'Consulting', count: 25, domain: 'consulting' },
      { name: 'HR & Recruitment', count: 20, domain: 'hr' },
      { name: 'BPO / Customer Support', count: 25, domain: 'bpo' },
      { name: 'Telecom', count: 20, domain: 'telecom' },
      { name: 'Travel & Hospitality', count: 25, domain: 'hospitality' },
      { name: 'Real Estate', count: 20, domain: 'realestate' },
      { name: 'Energy / Oil & Gas', count: 15, domain: 'energy' },
      { name: 'Government / Public Sector', count: 20, domain: 'government' },
      { name: 'Startups', count: 30, domain: 'startup' }
    ];

    // Experience levels with salary ranges (in INR)
    const experienceLevels = [
      { level: 'Fresher', years: '0-2', minSalary: 180000, maxSalary: 600000, weight: 0.25 },
      { level: 'Junior', years: '2-5', minSalary: 400000, maxSalary: 1200000, weight: 0.30 },
      { level: 'Mid-level', years: '5-10', minSalary: 800000, maxSalary: 2500000, weight: 0.25 },
      { level: 'Senior', years: '10-15', minSalary: 1800000, maxSalary: 4500000, weight: 0.15 },
      { level: 'Leadership', years: '15-20', minSalary: 3000000, maxSalary: 7000000, weight: 0.05 }
    ];

    // Indian cities with realistic distribution
    const cities = [
      'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune',
      'Gurgaon', 'Noida', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Indore',
      'Chandigarh', 'Kochi', 'Lucknow', 'Coimbatore', 'Nagpur', 'Vadodara'
    ];

    const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance'];
    
    let generatedJobs = [];
    let totalGenerated = 0;

    for (const industry of industries) {
      console.log(`Generating ${industry.count} jobs for ${industry.name}...`);
      
      for (let i = 0; i < industry.count && totalGenerated < 500; i++) {
        // Select experience level based on weights
        const expLevel = weightedRandom(experienceLevels);
        const city = cities[Math.floor(Math.random() * cities.length)];
        const employmentType = employmentTypes[Math.floor(Math.random() * employmentTypes.length)];
        
        // Generate salary within range with some variance
        const salaryVariance = 0.3; // 30% variance
        const baseMin = expLevel.minSalary;
        const baseMax = expLevel.maxSalary;
        const variance = (baseMax - baseMin) * salaryVariance;
        
        const salaryMin = Math.floor(baseMin + (Math.random() - 0.5) * variance);
        const salaryMax = Math.floor(baseMax + (Math.random() - 0.5) * variance);

        // Generate job using AI
        const jobPrompt = `Generate a realistic job posting for the ${industry.name} industry:
        
        Industry: ${industry.name}
        Experience Level: ${expLevel.level} (${expLevel.years} years)
        Location: ${city}, India
        Employment Type: ${employmentType}
        Salary Range: ₹${Math.floor(salaryMin/100000)} - ₹${Math.floor(salaryMax/100000)} LPA
        
        Return ONLY a JSON object with these exact fields:
        {
          "title": "Job Title",
          "company_name": "Company Name",
          "description": "Detailed job description (150-300 words)",
          "requirements": "Key requirements and qualifications",
          "skills_required": ["skill1", "skill2", "skill3", "skill4", "skill5"],
          "benefits": ["benefit1", "benefit2", "benefit3"]
        }
        
        Make it realistic for the Indian job market. Use actual company types and job roles common in ${industry.name}.`;

        try {
          const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: 'You are an expert HR professional creating realistic job postings for the Indian market. Return only valid JSON without any markdown formatting.'
                },
                { role: 'user', content: jobPrompt }
              ],
              temperature: 0.8,
              max_tokens: 800
            }),
          });

          const aiData = await aiResponse.json();
          let jobData;
          
          try {
            const content = aiData.choices[0].message.content.trim();
            // Remove any markdown formatting if present
            const cleanContent = content.replace(/```json\n?|\n?```/g, '');
            jobData = JSON.parse(cleanContent);
          } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            continue; // Skip this job and try next
          }

          // Create complete job object
          const job = {
            title: jobData.title,
            description: jobData.description,
            company_name: jobData.company_name,
            location: `${city}, India`,
            salary_min: salaryMin,
            salary_max: salaryMax,
            salary_range: `₹${Math.floor(salaryMin/100000)} - ₹${Math.floor(salaryMax/100000)} LPA`,
            employment_type: employmentType,
            experience_level: expLevel.level,
            skills_required: jobData.skills_required || [],
            requirements: jobData.requirements,
            benefits: jobData.benefits || [],
            is_remote: Math.random() < 0.3, // 30% remote jobs
            is_featured: Math.random() < 0.1, // 10% featured
            is_active: true,
            job_status: 'open',
            role_category: industry.domain,
            posted_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            views_count: Math.floor(Math.random() * 100) + 10,
            applications_count: Math.floor(Math.random() * 20)
          };

          generatedJobs.push(job);
          totalGenerated++;
          
          console.log(`Generated job ${totalGenerated}: ${job.title} at ${job.company_name}`);
          
        } catch (error) {
          console.error(`Error generating job ${totalGenerated + 1}:`, error);
          continue;
        }
      }
    }

    console.log(`Generated ${generatedJobs.length} jobs. Inserting into database...`);

    // Insert jobs in batches of 50
    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < generatedJobs.length; i += batchSize) {
      const batch = generatedJobs.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('jobs')
        .insert(batch);

      if (error) {
        console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
      } else {
        insertedCount += batch.length;
        console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} jobs`);
      }
    }

    console.log(`Successfully inserted ${insertedCount} realistic jobs`);

    return new Response(JSON.stringify({
      success: true,
      message: `Generated and inserted ${insertedCount} realistic job listings`,
      breakdown: {
        total_generated: generatedJobs.length,
        total_inserted: insertedCount,
        industries_covered: industries.length,
        experience_levels: experienceLevels.length,
        cities_covered: cities.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-realistic-jobs:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function for weighted random selection
function weightedRandom(items: any[]) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item;
    }
  }
  
  return items[items.length - 1]; // fallback
}