import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// SEO optimization templates and rules
const SEO_TEMPLATES = {
  job_page: {
    meta_title: "{job_title} at {company_name} | {location} | TalentXcel",
    meta_description: "Apply for {job_title} position at {company_name} in {location}. {salary_info} Explore career opportunities and grow your career with TalentXcel.",
    h1_title: "{job_title} - {company_name}",
    structured_data_type: "JobPosting"
  },
  location_page: {
    meta_title: "Jobs in {location} | Latest Job Openings | TalentXcel",
    meta_description: "Find the best job opportunities in {location}. Browse {job_count}+ latest job openings from top companies. Apply now on TalentXcel.",
    h1_title: "Jobs in {location}",
    structured_data_type: "ItemList"
  },
  skill_page: {
    meta_title: "{skill} Jobs | {skill} Career Opportunities | TalentXcel",
    meta_description: "Explore {skill} job opportunities. Find {job_count}+ {skill} jobs with competitive salaries. Build your {skill} career with TalentXcel.",
    h1_title: "{skill} Jobs & Career Opportunities",
    structured_data_type: "ItemList"
  },
  company_page: {
    meta_title: "{company_name} Jobs | Careers at {company_name} | TalentXcel",
    meta_description: "Explore career opportunities at {company_name}. {job_count}+ open positions. Join {company_name} and advance your career.",
    h1_title: "Careers at {company_name}",
    structured_data_type: "Organization"
  }
};

// Generate AI-optimized SEO content
async function generateAISEOContent(contentType: string, data: any): Promise<any> {
  if (!openAIApiKey) {
    console.log('⚠️ OpenAI API key not found, using template-based SEO generation');
    return generateTemplateSEOContent(contentType, data);
  }

  try {
    const prompt = createSEOPrompt(contentType, data);
    
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
            content: `You are an expert SEO content creator. Generate high-quality, engaging SEO content that follows best practices:
            - Meta titles under 60 characters
            - Meta descriptions 150-160 characters
            - Natural keyword integration
            - Compelling, click-worthy copy
            - Include relevant long-tail keywords
            - Optimize for Indian job market
            Return JSON format only.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`AI SEO generation failed: ${response.status}`);
    }

    const result = await response.json();
    const aiContent = result.choices[0]?.message?.content;
    
    if (aiContent) {
      return JSON.parse(aiContent);
    }
  } catch (error) {
    console.error('❌ AI SEO generation error:', error);
  }
  
  // Fallback to template-based generation
  return generateTemplateSEOContent(contentType, data);
}

function createSEOPrompt(contentType: string, data: any): string {
  switch (contentType) {
    case 'job_page':
      return `Generate SEO content for a job posting:
      Job Title: ${data.title}
      Company: ${data.company_name}
      Location: ${data.location}
      Salary: ${data.salary_range || 'Competitive'}
      Experience: ${data.experience_level}
      Skills: ${data.skills_required?.join(', ')}
      
      Return JSON with: meta_title, meta_description, h1_title, target_keywords (array), content_summary`;
      
    case 'location_page':
      return `Generate SEO content for a location-based job page:
      Location: ${data.location}
      Job Count: ${data.job_count}
      Top Companies: ${data.top_companies?.join(', ')}
      Top Skills: ${data.top_skills?.join(', ')}
      Average Salary: ${data.avg_salary}
      
      Return JSON with: meta_title, meta_description, h1_title, target_keywords (array), content_blocks`;
      
    case 'skill_page':
      return `Generate SEO content for a skill-based job page:
      Skill: ${data.skill}
      Job Count: ${data.job_count}
      Average Salary: ${data.avg_salary}
      Top Locations: ${data.top_locations?.join(', ')}
      Related Skills: ${data.related_skills?.join(', ')}
      
      Return JSON with: meta_title, meta_description, h1_title, target_keywords (array), content_blocks`;
      
    case 'company_page':
      return `Generate SEO content for a company careers page:
      Company: ${data.company_name}
      Industry: ${data.industry}
      Job Count: ${data.job_count}
      Locations: ${data.locations?.join(', ')}
      
      Return JSON with: meta_title, meta_description, h1_title, target_keywords (array), content_blocks`;
      
    default:
      return `Generate SEO content for: ${JSON.stringify(data)}`;
  }
}

// Template-based SEO content generation
function generateTemplateSEOContent(contentType: string, data: any): any {
  const template = SEO_TEMPLATES[contentType as keyof typeof SEO_TEMPLATES];
  
  if (!template) {
    return {
      meta_title: `${data.title || data.name} | TalentXcel`,
      meta_description: `Explore opportunities with ${data.title || data.name} on TalentXcel - India's leading job platform.`,
      h1_title: data.title || data.name,
      target_keywords: [],
      seo_score: 60
    };
  }
  
  let metaTitle = template.meta_title;
  let metaDescription = template.meta_description;
  let h1Title = template.h1_title;
  
  // Replace placeholders
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (typeof value === 'string' || typeof value === 'number') {
      metaTitle = metaTitle.replace(new RegExp(`{${key}}`, 'g'), String(value));
      metaDescription = metaDescription.replace(new RegExp(`{${key}}`, 'g'), String(value));
      h1Title = h1Title.replace(new RegExp(`{${key}}`, 'g'), String(value));
    }
  });
  
  // Generate target keywords
  const targetKeywords = generateTargetKeywords(contentType, data);
  
  // Calculate SEO score
  const seoScore = calculateSEOScore(metaTitle, metaDescription, targetKeywords);
  
  return {
    meta_title: metaTitle.substring(0, 60),
    meta_description: metaDescription.substring(0, 160),
    h1_title: h1Title,
    target_keywords: targetKeywords,
    seo_score: seoScore,
    structured_data_type: template.structured_data_type
  };
}

function generateTargetKeywords(contentType: string, data: any): string[] {
  const keywords: string[] = [];
  
  switch (contentType) {
    case 'job_page':
      keywords.push(
        data.title,
        `${data.title} jobs`,
        `${data.title} ${data.location}`,
        `${data.company_name} jobs`,
        `${data.title} ${data.company_name}`,
        ...(data.skills_required || [])
      );
      break;
      
    case 'location_page':
      keywords.push(
        `jobs in ${data.location}`,
        `${data.location} jobs`,
        `${data.location} careers`,
        `job openings ${data.location}`,
        `latest jobs ${data.location}`
      );
      break;
      
    case 'skill_page':
      keywords.push(
        `${data.skill} jobs`,
        `${data.skill} careers`,
        `${data.skill} developer jobs`,
        `${data.skill} opportunities`,
        `learn ${data.skill}`
      );
      break;
      
    case 'company_page':
      keywords.push(
        `${data.company_name} jobs`,
        `${data.company_name} careers`,
        `${data.company_name} hiring`,
        `work at ${data.company_name}`,
        `${data.company_name} openings`
      );
      break;
  }
  
  return keywords.filter(k => k && k.length > 2).slice(0, 10);
}

function calculateSEOScore(title: string, description: string, keywords: string[]): number {
  let score = 50; // Base score
  
  // Title optimization
  if (title.length >= 30 && title.length <= 60) score += 15;
  if (title.includes('|')) score += 5;
  
  // Description optimization
  if (description.length >= 120 && description.length <= 160) score += 15;
  if (description.includes('Apply') || description.includes('Explore') || description.includes('Join')) score += 5;
  
  // Keyword optimization
  if (keywords.length >= 5) score += 10;
  
  return Math.min(100, score);
}

// Generate structured data for SEO
function generateStructuredData(contentType: string, data: any): any {
  const baseStructure = {
    "@context": "https://schema.org",
    "@type": "",
    "url": `https://talentxcel.com/${contentType}/${data.id}`,
    "name": data.title || data.name
  };
  
  switch (contentType) {
    case 'job_page':
      return {
        ...baseStructure,
        "@type": "JobPosting",
        "title": data.title,
        "description": data.description,
        "hiringOrganization": {
          "@type": "Organization",
          "name": data.company_name
        },
        "jobLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": data.location
          }
        },
        "baseSalary": data.salary_min ? {
          "@type": "MonetaryAmount",
          "currency": "INR",
          "value": {
            "@type": "QuantitativeValue",
            "minValue": data.salary_min,
            "maxValue": data.salary_max,
            "unitText": "YEAR"
          }
        } : undefined,
        "employmentType": data.employment_type?.toUpperCase(),
        "experienceRequirements": data.experience_level,
        "skills": data.skills_required,
        "datePosted": data.created_at || new Date().toISOString()
      };
      
    case 'location_page':
      return {
        ...baseStructure,
        "@type": "ItemList",
        "description": `Job opportunities in ${data.location}`,
        "numberOfItems": data.job_count
      };
      
    case 'skill_page':
      return {
        ...baseStructure,
        "@type": "ItemList",
        "description": `${data.skill} job opportunities and career paths`,
        "numberOfItems": data.job_count
      };
      
    case 'company_page':
      return {
        ...baseStructure,
        "@type": "Organization",
        "description": `Career opportunities at ${data.company_name}`,
        "numberOfEmployees": data.employee_count
      };
      
    default:
      return baseStructure;
  }
}

async function processBulkSEOOptimization(
  contentType: string, 
  batchSize: number = 100, 
  generateStructuredData: boolean = true,
  createLandingPages: boolean = false
) {
  console.log(`🎯 Starting bulk SEO optimization for ${contentType}, batch size: ${batchSize}`);
  
  try {
    let query;
    let entityQuery;
    
    // Determine what to optimize based on content type
    switch (contentType) {
      case 'job_pages':
        query = supabase
          .from('jobs')
          .select('id, title, company_name, location, salary_range, salary_min, salary_max, experience_level, employment_type, skills_required, description, created_at')
          .eq('is_active', true)
          .is('meta_title', null)
          .limit(batchSize);
        break;
        
      case 'location_pages':
        // Get top locations with job counts
        const { data: locations } = await supabase
          .from('jobs')
          .select('location')
          .eq('is_active', true)
          .not('location', 'is', null);
        
        const locationCounts = locations?.reduce((acc: any, job) => {
          acc[job.location] = (acc[job.location] || 0) + 1;
          return acc;
        }, {}) || {};
        
        entityQuery = Object.entries(locationCounts)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, batchSize)
          .map(([location, count]) => ({
            id: location.toLowerCase().replace(/\s+/g, '-'),
            location,
            job_count: count,
            type: 'location'
          }));
        break;
        
      case 'skill_pages':
        // Get top skills with job counts
        const { data: jobs } = await supabase
          .from('jobs')
          .select('skills_required')
          .eq('is_active', true)
          .not('skills_required', 'is', null)
          .limit(1000);
        
        const skillCounts: any = {};
        jobs?.forEach(job => {
          job.skills_required?.forEach((skill: string) => {
            skillCounts[skill] = (skillCounts[skill] || 0) + 1;
          });
        });
        
        entityQuery = Object.entries(skillCounts)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, batchSize)
          .map(([skill, count]) => ({
            id: skill.toLowerCase().replace(/\s+/g, '-'),
            skill,
            job_count: count,
            type: 'skill'
          }));
        break;
        
      case 'company_pages':
        // Get top companies with job counts
        const { data: companies } = await supabase
          .from('jobs')
          .select('company_name')
          .eq('is_active', true)
          .not('company_name', 'is', null);
        
        const companyCounts = companies?.reduce((acc: any, job) => {
          acc[job.company_name] = (acc[job.company_name] || 0) + 1;
          return acc;
        }, {}) || {};
        
        entityQuery = Object.entries(companyCounts)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, batchSize)
          .map(([company_name, count]) => ({
            id: company_name.toLowerCase().replace(/\s+/g, '-'),
            company_name,
            job_count: count,
            type: 'company'
          }));
        break;
        
      default:
        throw new Error(`Unsupported content type: ${contentType}`);
    }
    
    let entities;
    if (contentType === 'job_pages') {
      const { data, error } = await query;
      if (error) throw error;
      entities = data;
    } else {
      entities = entityQuery;
    }
    
    if (!entities || entities.length === 0) {
      return { optimizedCount: 0, message: 'No entities found for optimization' };
    }
    
    console.log(`📊 Processing ${entities.length} entities for SEO optimization`);
    
    let optimizedCount = 0;
    const seoContents = [];
    const landingPages = [];
    
    // Process entities in smaller batches
    const processingBatchSize = 10;
    for (let i = 0; i < entities.length; i += processingBatchSize) {
      const entityBatch = entities.slice(i, i + processingBatchSize);
      
      const batchPromises = entityBatch.map(async (entity) => {
        try {
          // Generate SEO content
          const seoContent = await generateAISEOContent(
            contentType.replace('_pages', '_page'), 
            entity
          );
          
          // Generate structured data if requested
          let structuredData = {};
          if (generateStructuredData) {
            structuredData = generateStructuredData(
              contentType.replace('_pages', '_page'), 
              entity
            );
          }
          
          const seoRecord = {
            content_type: contentType.replace('_pages', '_page'),
            entity_id: entity.id,
            entity_type: entity.type || 'job',
            meta_title: seoContent.meta_title,
            meta_description: seoContent.meta_description,
            h1_title: seoContent.h1_title,
            content_blocks: seoContent.content_blocks || {},
            structured_data: structuredData,
            target_keywords: seoContent.target_keywords || [],
            seo_score: seoContent.seo_score || 70,
            ai_model_used: openAIApiKey ? 'gpt-4.1-2025-04-14' : 'template-based',
            generation_time_ms: 100,
            status: 'generated'
          };
          
          seoContents.push(seoRecord);
          
          // Create landing page if requested
          if (createLandingPages && contentType !== 'job_pages') {
            const landingPage = {
              page_type: contentType.replace('_pages', '_jobs'),
              slug: entity.id,
              target_location: entity.location,
              target_skill: entity.skill,
              target_company: entity.company_name,
              page_title: seoContent.h1_title,
              meta_description: seoContent.meta_description,
              content_sections: seoContent.content_blocks || {},
              target_keywords: seoContent.target_keywords || [],
              related_jobs_count: entity.job_count || 0,
              is_active: true
            };
            
            landingPages.push(landingPage);
          }
          
          // Update job record with SEO data if it's a job page
          if (contentType === 'job_pages') {
            await supabase
              .from('jobs')
              .update({
                meta_title: seoContent.meta_title,
                meta_description: seoContent.meta_description,
                updated_at: new Date().toISOString()
              })
              .eq('id', entity.id);
          }
          
          optimizedCount++;
          return { entityId: entity.id, success: true };
          
        } catch (error) {
          console.error(`❌ Error processing entity ${entity.id}:`, error);
          return { entityId: entity.id, success: false, error: error.message };
        }
      });
      
      await Promise.all(batchPromises);
      
      // Small delay between batches
      if (i + processingBatchSize < entities.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // Bulk insert SEO content records
    if (seoContents.length > 0) {
      await supabase
        .from('seo_content_automation')
        .insert(seoContents);
    }
    
    // Bulk insert landing pages
    if (landingPages.length > 0) {
      await supabase
        .from('dynamic_landing_pages')
        .insert(landingPages);
    }
    
    console.log(`✅ Bulk SEO optimization completed: ${optimizedCount} entities optimized`);
    
    return {
      optimizedCount,
      seoContentGenerated: seoContents.length,
      landingPagesCreated: landingPages.length,
      contentType
    };
    
  } catch (error) {
    console.error('❌ Bulk SEO optimization failed:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      contentType = 'job_pages', 
      batchSize = 100, 
      generateStructuredData = true,
      createLandingPages = false 
    } = await req.json();
    
    console.log(`🎯 Bulk SEO optimization request:`, { 
      contentType, 
      batchSize, 
      generateStructuredData,
      createLandingPages 
    });

    const result = await processBulkSEOOptimization(
      contentType, 
      batchSize, 
      generateStructuredData,
      createLandingPages
    );

    return new Response(JSON.stringify({
      success: true,
      message: `Bulk SEO optimization completed successfully!`,
      ...result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('❌ Bulk SEO optimization error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});