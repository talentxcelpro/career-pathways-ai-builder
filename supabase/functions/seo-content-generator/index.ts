import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Initialize Supabase client with service role key for full access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SEOGenerationRequest {
  pageType: string;
  primarySlug: string;
  secondarySlug?: string;
  tertiarySlug?: string;
  additionalData?: any;
}

interface SEOContent {
  metaTitle: string;
  metaDescription: string;
  h1Title: string;
  introContent: string;
  faqs: Array<{ question: string; answer: string }>;
  structuredData: any;
  contentBlocks: any;
  keywords: string[];
}

const generateSEOContent = async (request: SEOGenerationRequest): Promise<SEOContent> => {
  const { pageType, primarySlug, secondarySlug, tertiarySlug, additionalData } = request;
  
  let prompt = '';
  let contextData = {};

  // Get context data from database based on page type
  switch (pageType) {
    case 'job_location':
      const { data: locationData } = await supabase
        .from('seo_locations')
        .select('*')
        .eq('slug', primarySlug)
        .single();
      
      contextData = locationData;
      prompt = `Generate comprehensive SEO content for a job search page targeting "${locationData?.name || primarySlug}" location in India.

Include:
- SEO title (55-60 chars) mentioning jobs in ${locationData?.name}
- Meta description (150-160 chars) about job opportunities 
- H1 title for the page
- 2-3 paragraph intro about job market in ${locationData?.name}
- 5 relevant FAQs about jobs in this location
- Keywords array (10-15 keywords)
- Content blocks for salary info, top companies, skills in demand

Context: ${locationData?.job_count || 0} jobs available, ${locationData?.company_count || 0} companies hiring.`;
      break;

    case 'job_role':
      const { data: roleData } = await supabase
        .from('seo_roles')
        .select('*')
        .eq('slug', primarySlug)
        .single();
      
      contextData = roleData;
      prompt = `Generate comprehensive SEO content for a job search page targeting "${roleData?.name || primarySlug}" role.

Include:
- SEO title (55-60 chars) about ${roleData?.name} jobs
- Meta description (150-160 chars) about career opportunities
- H1 title for the page
- 2-3 paragraph intro about ${roleData?.name} role and career prospects
- 5 relevant FAQs about this role
- Keywords array (10-15 keywords)
- Content blocks for salary info, required skills, career growth

Context: Average salary ₹${roleData?.avg_salary || 0}, ${roleData?.job_count || 0} jobs available, ${roleData?.category} category.`;
      break;

    case 'job_skill':
      const { data: skillData } = await supabase
        .from('seo_skills')
        .select('*')
        .eq('slug', primarySlug)
        .single();
      
      contextData = skillData;
      prompt = `Generate comprehensive SEO content for a job search page targeting "${skillData?.name || primarySlug}" skill.

Include:
- SEO title (55-60 chars) about ${skillData?.name} jobs
- Meta description (150-160 chars) about opportunities with this skill
- H1 title for the page
- 2-3 paragraph intro about ${skillData?.name} skill and job market
- 5 relevant FAQs about careers with this skill
- Keywords array (10-15 keywords)
- Content blocks for salary potential, learning resources, related skills

Context: ${skillData?.job_count || 0} jobs available, ${skillData?.demand_level} demand level, ${skillData?.category} category.`;
      break;

    case 'salary_guide':
      const { data: salaryRoleData } = await supabase
        .from('seo_roles')
        .select('*')
        .eq('slug', primarySlug)
        .single();
      
      const { data: salaryLocationData } = await supabase
        .from('seo_locations')
        .select('*')
        .eq('slug', secondarySlug || 'bangalore')
        .single();
      
      contextData = { role: salaryRoleData, location: salaryLocationData };
      prompt = `Generate comprehensive SEO content for a salary guide page for "${salaryRoleData?.name || primarySlug}" in "${salaryLocationData?.name || secondarySlug}".

Include:
- SEO title (55-60 chars) about ${salaryRoleData?.name} salary in ${salaryLocationData?.name}
- Meta description (150-160 chars) about salary expectations
- H1 title for the page
- 2-3 paragraph intro about salary trends and factors
- 5 relevant FAQs about salary negotiation and growth
- Keywords array (10-15 keywords)
- Content blocks for salary ranges, bonus info, career progression

Context: Average salary ₹${salaryRoleData?.avg_salary || 0}, location has ${salaryLocationData?.job_count || 0} jobs.`;
      break;

    case 'industry':
      const { data: industryData } = await supabase
        .from('seo_industries')
        .select('*')
        .eq('slug', primarySlug)
        .single();
      
      contextData = industryData;
      prompt = `Generate comprehensive SEO content for an industry overview page for "${industryData?.name || primarySlug}" industry.

Include:
- SEO title (55-60 chars) about ${industryData?.name} industry jobs
- Meta description (150-160 chars) about industry opportunities
- H1 title for the page
- 2-3 paragraph intro about industry trends and growth
- 5 relevant FAQs about careers in this industry
- Keywords array (10-15 keywords)
- Content blocks for top roles, growth prospects, skill requirements

Context: ${industryData?.job_count || 0} jobs, ${industryData?.company_count || 0} companies, ${industryData?.growth_rate}% growth rate.`;
      break;

    default:
      throw new Error(`Unsupported page type: ${pageType}`);
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: `You are an expert SEO content writer specializing in job search and career websites. Create high-quality, engaging content that ranks well on search engines while being helpful to job seekers. 

Return ONLY a valid JSON object with this exact structure:
{
  "metaTitle": "string (55-60 chars)",
  "metaDescription": "string (150-160 chars)", 
  "h1Title": "string",
  "introContent": "string (2-3 paragraphs)",
  "faqs": [{"question": "string", "answer": "string"}],
  "keywords": ["string"],
  "contentBlocks": {
    "salaryInfo": "string",
    "topCompanies": "string", 
    "skillsRequired": "string",
    "careerGrowth": "string"
  },
  "structuredData": {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "string",
    "description": "string"
  }
}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse AI response:', content);
    throw new Error('Invalid JSON response from AI');
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { pageType, primarySlug, secondarySlug, tertiarySlug, forceRegenerate = false } = await req.json();

    console.log(`Generating SEO content for ${pageType}: ${primarySlug}/${secondarySlug || ''}/${tertiarySlug || ''}`);

    // Check if content already exists and is fresh (unless forcing regeneration)
    if (!forceRegenerate) {
      const { data: existingContent } = await supabase
        .from('seo_generated_content')
        .select('*')
        .eq('page_type', pageType)
        .eq('primary_slug', primarySlug)
        .eq('secondary_slug', secondarySlug || null)
        .eq('tertiary_slug', tertiarySlug || null)
        .eq('is_active', true)
        .gte('last_generated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // 7 days
        .single();

      if (existingContent) {
        console.log('Returning existing content');
        return new Response(JSON.stringify({ 
          success: true, 
          content: existingContent,
          cached: true 
        }), {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600', // Cache for 24 hours
          },
        });
      }
    }

    // Generate new content
    const generatedContent = await generateSEOContent({
      pageType,
      primarySlug,
      secondarySlug,
      tertiarySlug
    });

    // Store in database
    const { data: savedContent, error } = await supabase
      .from('seo_generated_content')
      .upsert({
        page_type: pageType,
        primary_slug: primarySlug,
        secondary_slug: secondarySlug || null,
        tertiary_slug: tertiarySlug || null,
        meta_title: generatedContent.metaTitle,
        meta_description: generatedContent.metaDescription,
        h1_title: generatedContent.h1Title,
        intro_content: generatedContent.introContent,
        faqs: generatedContent.faqs,
        structured_data: generatedContent.structuredData,
        content_blocks: generatedContent.contentBlocks,
        keywords: generatedContent.keywords,
        last_generated_at: new Date().toISOString(),
        quality_score: 85 // Default score, can be improved with analytics
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to save generated content');
    }

    console.log('Successfully generated and saved SEO content');

    return new Response(JSON.stringify({ 
      success: true, 
      content: savedContent,
      cached: false 
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600', // Cache for 24 hours
      },
    });

  } catch (error) {
    console.error('Error in seo-content-generator:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});