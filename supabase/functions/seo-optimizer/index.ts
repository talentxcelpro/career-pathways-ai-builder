import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SEOOptimizationRequest {
  url?: string;
  contentType: 'job' | 'company' | 'post' | 'profile';
  entityId: string;
  priority?: 'low' | 'medium' | 'high';
  includeStructuredData?: boolean;
  updateMetaTags?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const {
      url,
      contentType,
      entityId,
      priority = 'medium',
      includeStructuredData = true,
      updateMetaTags = true
    }: SEOOptimizationRequest = await req.json();

    console.log(`🎯 Starting SEO optimization for ${contentType} ID: ${entityId}`);

    // Fetch entity data based on content type
    let entityData;
    let tableName;
    
    switch (contentType) {
      case 'job':
        tableName = 'jobs';
        break;
      case 'company':
        tableName = 'companies';
        break;
      case 'post':
        tableName = 'posts';
        break;
      case 'profile':
        tableName = 'profiles';
        break;
      default:
        throw new Error(`Unsupported content type: ${contentType}`);
    }

    const { data: entity, error: fetchError } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', entityId)
      .single();

    if (fetchError || !entity) {
      throw new Error(`Failed to fetch ${contentType} with ID ${entityId}`);
    }

    // Generate SEO optimizations
    const seoOptimizations = await generateSEOOptimizations(entity, contentType);

    // Update meta tags if requested
    if (updateMetaTags) {
      await updateEntityMetaTags(supabase, tableName, entityId, seoOptimizations.metaTags);
    }

    // Generate structured data if requested
    let structuredData = null;
    if (includeStructuredData) {
      structuredData = generateStructuredData(entity, contentType);
    }

    // Store SEO optimization record
    const { error: insertError } = await supabase
      .from('seo_optimizations')
      .insert({
        entity_type: contentType,
        entity_id: entityId,
        url: url || generateEntityUrl(entity, contentType),
        meta_title: seoOptimizations.metaTags.title,
        meta_description: seoOptimizations.metaTags.description,
        keywords: seoOptimizations.keywords,
        structured_data: structuredData,
        priority,
        status: 'completed',
        optimized_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Failed to store SEO optimization:', insertError);
    }

    console.log(`✅ SEO optimization completed for ${contentType} ID: ${entityId}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'SEO optimization completed successfully',
      optimizations: seoOptimizations,
      structuredData,
      entityId,
      contentType
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ SEO optimization error:', error);
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

async function generateSEOOptimizations(entity: any, contentType: string) {
  const optimizations = {
    metaTags: {
      title: '',
      description: '',
      keywords: []
    },
    keywords: [],
    readabilityScore: 0,
    suggestions: []
  };

  switch (contentType) {
    case 'job':
      optimizations.metaTags.title = `${entity.title} at ${entity.company_name || 'Top Company'} | TalentXcel`;
      optimizations.metaTags.description = `Apply for ${entity.title} position. ${entity.location ? `Location: ${entity.location}. ` : ''}${entity.salary_range ? `Salary: ${entity.salary_range}. ` : ''}Join TalentXcel to find your dream job.`;
      optimizations.keywords = extractJobKeywords(entity);
      break;
    
    case 'company':
      optimizations.metaTags.title = `${entity.name} Jobs & Careers | TalentXcel`;
      optimizations.metaTags.description = `Explore career opportunities at ${entity.name}. ${entity.description ? entity.description.substring(0, 120) + '...' : 'Find your next role with this innovative company.'}`;
      optimizations.keywords = extractCompanyKeywords(entity);
      break;
    
    case 'post':
      optimizations.metaTags.title = entity.title || `${entity.content?.substring(0, 50)}... | TalentXcel`;
      optimizations.metaTags.description = entity.content?.substring(0, 150) + '...' || 'Professional insights and career advice on TalentXcel.';
      optimizations.keywords = extractPostKeywords(entity);
      break;
    
    case 'profile':
      optimizations.metaTags.title = `${entity.full_name} - ${entity.headline || 'Professional Profile'} | TalentXcel`;
      optimizations.metaTags.description = `Connect with ${entity.full_name} on TalentXcel. ${entity.bio ? entity.bio.substring(0, 120) + '...' : 'View professional profile and career journey.'}`;
      optimizations.keywords = extractProfileKeywords(entity);
      break;
  }

  return optimizations;
}

function extractJobKeywords(job: any): string[] {
  const keywords = [];
  if (job.title) keywords.push(job.title);
  if (job.company_name) keywords.push(job.company_name);
  if (job.location) keywords.push(job.location);
  if (job.job_type) keywords.push(job.job_type);
  if (job.skills) keywords.push(...job.skills);
  return [...new Set(keywords.filter(k => k && k.length > 2))];
}

function extractCompanyKeywords(company: any): string[] {
  const keywords = [];
  if (company.name) keywords.push(company.name);
  if (company.industry) keywords.push(company.industry);
  if (company.location) keywords.push(company.location);
  if (company.company_size) keywords.push(company.company_size);
  return [...new Set(keywords.filter(k => k && k.length > 2))];
}

function extractPostKeywords(post: any): string[] {
  const keywords = [];
  if (post.title) keywords.push(post.title);
  if (post.tags) keywords.push(...post.tags);
  if (post.category) keywords.push(post.category);
  return [...new Set(keywords.filter(k => k && k.length > 2))];
}

function extractProfileKeywords(profile: any): string[] {
  const keywords = [];
  if (profile.full_name) keywords.push(profile.full_name);
  if (profile.headline) keywords.push(profile.headline);
  if (profile.current_company) keywords.push(profile.current_company);
  if (profile.location) keywords.push(profile.location);
  if (profile.skills) keywords.push(...profile.skills);
  return [...new Set(keywords.filter(k => k && k.length > 2))];
}

function generateStructuredData(entity: any, contentType: string) {
  const baseStructure = {
    "@context": "https://schema.org",
    "@type": getSchemaType(contentType),
    "url": generateEntityUrl(entity, contentType)
  };

  switch (contentType) {
    case 'job':
      return {
        ...baseStructure,
        "@type": "JobPosting",
        "title": entity.title,
        "description": entity.description,
        "hiringOrganization": {
          "@type": "Organization",
          "name": entity.company_name
        },
        "jobLocation": {
          "@type": "Place",
          "address": entity.location
        },
        "employmentType": entity.job_type,
        "datePosted": entity.created_at
      };
    
    case 'company':
      return {
        ...baseStructure,
        "@type": "Organization",
        "name": entity.name,
        "description": entity.description,
        "address": entity.location,
        "numberOfEmployees": entity.employee_count
      };
    
    default:
      return baseStructure;
  }
}

function getSchemaType(contentType: string): string {
  switch (contentType) {
    case 'job': return 'JobPosting';
    case 'company': return 'Organization';
    case 'post': return 'Article';
    case 'profile': return 'Person';
    default: return 'Thing';
  }
}

function generateEntityUrl(entity: any, contentType: string): string {
  const baseUrl = 'https://talentxcel.in';
  
  switch (contentType) {
    case 'job':
      return `${baseUrl}/jobs/${entity.id}`;
    case 'company':
      return `${baseUrl}/companies/${entity.id}`;
    case 'post':
      return `${baseUrl}/posts/${entity.id}`;
    case 'profile':
      return `${baseUrl}/profile/${entity.id}`;
    default:
      return baseUrl;
  }
}

async function updateEntityMetaTags(supabase: any, tableName: string, entityId: string, metaTags: any) {
  try {
    const { error } = await supabase
      .from(tableName)
      .update({
        seo_title: metaTags.title,
        seo_description: metaTags.description,
        seo_keywords: metaTags.keywords,
        updated_at: new Date().toISOString()
      })
      .eq('id', entityId);
    
    if (error) {
      console.error('Failed to update meta tags:', error);
    }
  } catch (error) {
    console.error('Error updating meta tags:', error);
  }
}