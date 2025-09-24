import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { sessionToken, action, data } = await req.json();

    // Validate session
    const { data: session, error: sessionError } = await supabase
      .from('chrome_extension_sessions')
      .select('user_id')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = session.user_id;

    switch (action) {
      case 'extract_job_data': {
        // Extract job data from Indeed/Glassdoor
        const { platform, jobData } = data;

        const extractedJob = {
          title: jobData.title || '',
          company_name: jobData.company || '',
          location: jobData.location || '',
          salary_range: jobData.salary || '',
          description: jobData.description || '',
          requirements: jobData.requirements || '',
          benefits: jobData.benefits || '',
          job_type: jobData.jobType || '',
          experience_level: jobData.experienceLevel || '',
          post_date: jobData.postDate || new Date().toISOString(),
          external_url: jobData.url || '',
          platform: platform,
          extracted_at: new Date().toISOString()
        };

        // Store extracted job
        const { data: job, error: jobError } = await supabase
          .from('extracted_jobs')
          .insert({
            user_id: userId,
            platform,
            raw_data: jobData,
            extracted_data: extractedJob,
            status: 'active'
          })
          .select()
          .single();

        if (jobError) {
          console.error('Job extraction error:', jobError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to extract job data' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            job,
            extractedData: extractedJob
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'company_research': {
        // Research company from Glassdoor
        const { companyName, glassdoorData } = data;

        const companyInsights = {
          name: companyName,
          overall_rating: glassdoorData.overallRating || 0,
          work_life_balance: glassdoorData.workLifeBalance || 0,
          culture_values: glassdoorData.cultureValues || 0,
          career_opportunities: glassdoorData.careerOpportunities || 0,
          compensation_benefits: glassdoorData.compensationBenefits || 0,
          senior_management: glassdoorData.seniorManagement || 0,
          recommend_to_friend: glassdoorData.recommendToFriend || 0,
          ceo_approval: glassdoorData.ceoApproval || 0,
          total_reviews: glassdoorData.totalReviews || 0,
          salary_data: glassdoorData.salaryData || {},
          recent_reviews: glassdoorData.recentReviews || [],
          pros_cons: glassdoorData.prosCons || {},
          company_size: glassdoorData.companySize || '',
          industry: glassdoorData.industry || '',
          headquarters: glassdoorData.headquarters || '',
          founded: glassdoorData.founded || '',
          website: glassdoorData.website || ''
        };

        // Store company research
        const { data: research, error: researchError } = await supabase
          .from('company_research')
          .insert({
            user_id: userId,
            company_name: companyName,
            platform: 'glassdoor',
            insights: companyInsights,
            researched_at: new Date().toISOString()
          })
          .select()
          .single();

        if (researchError) {
          console.error('Company research error:', researchError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to store company research' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            research,
            insights: companyInsights,
            recommendations: generateCompanyRecommendations(companyInsights)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'salary_analysis': {
        // Analyze salary data from multiple sources
        const { jobTitle, location, experienceLevel, salaryData } = data;

        const salaryAnalysis = {
          job_title: jobTitle,
          location: location,
          experience_level: experienceLevel,
          market_average: calculateMarketAverage(salaryData),
          salary_range: calculateSalaryRange(salaryData),
          percentile_breakdown: calculatePercentiles(salaryData),
          industry_comparison: compareWithIndustry(salaryData),
          location_factor: calculateLocationFactor(location, salaryData),
          trending_direction: calculateTrend(salaryData),
          data_sources: salaryData.sources || []
        };

        // Store salary analysis
        const { data: analysis, error: analysisError } = await supabase
          .from('salary_analysis')
          .insert({
            user_id: userId,
            job_title: jobTitle,
            location: location,
            analysis_data: salaryAnalysis,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (analysisError) {
          console.error('Salary analysis error:', analysisError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to analyze salary data' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            analysis,
            salaryAnalysis,
            negotiationTips: generateNegotiationTips(salaryAnalysis)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'job_alerts': {
        // Set up intelligent job alerts
        const { keywords, locations, salaryRange, jobTypes, companies } = data;

        const alertConfig = {
          user_id: userId,
          platforms: ['indeed', 'glassdoor'],
          keywords: keywords || [],
          locations: locations || [],
          salary_min: salaryRange?.min || 0,
          salary_max: salaryRange?.max || 0,
          job_types: jobTypes || [],
          preferred_companies: companies || [],
          is_active: true,
          created_at: new Date().toISOString()
        };

        const { data: alert, error: alertError } = await supabase
          .from('intelligent_job_alerts')
          .insert(alertConfig)
          .select()
          .single();

        if (alertError) {
          console.error('Job alert creation error:', alertError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to create job alert' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            alert,
            message: 'Intelligent job alert created successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'application_tracking': {
        // Track job applications across platforms
        const { jobId, applicationData, platform } = data;

        const applicationTracker = {
          user_id: userId,
          job_id: jobId,
          platform: platform,
          application_date: new Date().toISOString(),
          status: 'applied',
          application_method: applicationData.method || 'website',
          cover_letter_used: applicationData.coverLetterUsed || false,
          resume_version: applicationData.resumeVersion || '',
          notes: applicationData.notes || '',
          company_response_expected: calculateResponseTime(platform),
          follow_up_date: calculateFollowUpDate()
        };

        const { data: tracker, error: trackerError } = await supabase
          .from('application_tracking')
          .insert(applicationTracker)
          .select()
          .single();

        if (trackerError) {
          console.error('Application tracking error:', trackerError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to track application' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Award TXC for job application
        await supabase.functions.invoke('extension-txc-miner', {
          body: {
            userId,
            activity: 'job_application',
            metadata: { platform, jobId }
          }
        });

        return new Response(
          JSON.stringify({
            success: true,
            tracker,
            message: 'Application tracked successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Indeed/Glassdoor integration error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateCompanyRecommendations(insights: any): string[] {
  const recommendations = [];
  
  if (insights.overall_rating >= 4.0) {
    recommendations.push('Highly rated company - great place to work!');
  } else if (insights.overall_rating < 3.0) {
    recommendations.push('Consider researching more about company culture');
  }
  
  if (insights.work_life_balance < 3.0) {
    recommendations.push('Work-life balance may be challenging');
  }
  
  if (insights.career_opportunities >= 4.0) {
    recommendations.push('Excellent career growth opportunities');
  }
  
  if (insights.compensation_benefits >= 4.0) {
    recommendations.push('Competitive compensation and benefits');
  }
  
  return recommendations;
}

function calculateMarketAverage(salaryData: any): number {
  if (!salaryData || !salaryData.samples) return 0;
  
  const total = salaryData.samples.reduce((sum: number, sample: any) => sum + sample.salary, 0);
  return Math.round(total / salaryData.samples.length);
}

function calculateSalaryRange(salaryData: any): any {
  if (!salaryData || !salaryData.samples) return { min: 0, max: 0 };
  
  const salaries = salaryData.samples.map((s: any) => s.salary).sort((a: number, b: number) => a - b);
  return {
    min: salaries[0] || 0,
    max: salaries[salaries.length - 1] || 0
  };
}

function calculatePercentiles(salaryData: any): any {
  if (!salaryData || !salaryData.samples) return {};
  
  const salaries = salaryData.samples.map((s: any) => s.salary).sort((a: number, b: number) => a - b);
  const len = salaries.length;
  
  return {
    p25: salaries[Math.floor(len * 0.25)] || 0,
    p50: salaries[Math.floor(len * 0.50)] || 0,
    p75: salaries[Math.floor(len * 0.75)] || 0,
    p90: salaries[Math.floor(len * 0.90)] || 0
  };
}

function compareWithIndustry(salaryData: any): string {
  // Simplified industry comparison
  const avgSalary = calculateMarketAverage(salaryData);
  if (avgSalary > 100000) return 'above_average';
  if (avgSalary > 60000) return 'average';
  return 'below_average';
}

function calculateLocationFactor(location: string, salaryData: any): number {
  // Simplified location factor
  const highCostCities = ['san francisco', 'new york', 'seattle', 'los angeles'];
  return highCostCities.some(city => location.toLowerCase().includes(city)) ? 1.3 : 1.0;
}

function calculateTrend(salaryData: any): string {
  // Simplified trend calculation
  return 'stable'; // Would need historical data for real trend analysis
}

function generateNegotiationTips(analysis: any): string[] {
  const tips = [];
  
  tips.push(`Market average for ${analysis.job_title} is $${analysis.market_average.toLocaleString()}`);
  
  if (analysis.percentile_breakdown.p75) {
    tips.push(`Top 25% earn $${analysis.percentile_breakdown.p75.toLocaleString()} or more`);
  }
  
  tips.push('Research the company\'s compensation philosophy');
  tips.push('Highlight your unique value proposition');
  tips.push('Consider total compensation, not just base salary');
  
  return tips;
}

function calculateResponseTime(platform: string): string {
  const responseTimes = {
    'indeed': '1-2 weeks',
    'glassdoor': '1-3 weeks',
    'default': '1-2 weeks'
  };
  
  return responseTimes[platform] || responseTimes.default;
}

function calculateFollowUpDate(): string {
  const followUpDate = new Date();
  followUpDate.setDate(followUpDate.getDate() + 14); // Follow up in 2 weeks
  return followUpDate.toISOString();
}