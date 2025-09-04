import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, data } = await req.json();
    console.log(`🔗 Internal linking automation action: ${action}`);

    switch (action) {
      case 'analyze_content':
        return await analyzeContentForLinks(supabase, data);
      case 'generate_internal_links':
        return await generateInternalLinks(supabase, data);
      case 'update_content_links':
        return await updateContentWithLinks(supabase, data);
      case 'track_link_performance':
        return await trackLinkPerformance(supabase, data);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('❌ Internal linking automation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeContentForLinks(supabase: any, data: any) {
  const { content_type, content_id, content_text } = data;
  
  console.log(`📊 Analyzing ${content_type} content for linking opportunities...`);
  
  // Analyze content for keywords and link opportunities
  const keywords = extractKeywords(content_text);
  const linkOpportunities = await findLinkOpportunities(supabase, keywords, content_type);
  
  // Store analysis results
  const { error } = await supabase
    .from('internal_link_analysis')
    .upsert({
      content_type,
      content_id,
      keywords,
      link_opportunities: linkOpportunities,
      analyzed_at: new Date().toISOString(),
      status: 'analyzed'
    });

  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    keywords,
    link_opportunities: linkOpportunities,
    analysis_id: `${content_type}_${content_id}`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function generateInternalLinks(supabase: any, data: any) {
  const { content_type, content_id, target_keywords } = data;
  
  console.log(`🎯 Generating internal links for ${content_type}...`);
  
  const internalLinks = [];
  
  // Job-to-Company links
  if (content_type === 'job') {
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, title, company_name, company_id')
      .eq('id', content_id)
      .single();
    
    if (jobs?.company_id) {
      internalLinks.push({
        type: 'company_profile',
        anchor_text: jobs.company_name,
        target_url: `/companies/${jobs.company_id}`,
        context: 'company_mention',
        priority: 'high'
      });
    }
    
    // Related jobs links
    const { data: relatedJobs } = await supabase
      .from('jobs')
      .select('id, title, seo_slug')
      .neq('id', content_id)
      .ilike('title', `%${jobs.title.split(' ')[0]}%`)
      .limit(3);
    
    relatedJobs?.forEach(job => {
      internalLinks.push({
        type: 'related_job',
        anchor_text: `${job.title} opportunities`,
        target_url: `/jobs/${job.seo_slug || job.id}`,
        context: 'related_content',
        priority: 'medium'
      });
    });
  }
  
  // Company-to-Jobs links
  if (content_type === 'company') {
    const { data: companyJobs } = await supabase
      .from('jobs')
      .select('id, title, seo_slug')
      .eq('company_id', content_id)
      .eq('is_active', true)
      .limit(5);
    
    companyJobs?.forEach(job => {
      internalLinks.push({
        type: 'company_job',
        anchor_text: job.title,
        target_url: `/jobs/${job.seo_slug || job.id}`,
        context: 'company_opportunities',
        priority: 'high'
      });
    });
  }
  
  // Skill-based linking
  for (const keyword of target_keywords) {
    // Link to skill pages
    const { data: skillPages } = await supabase
      .from('seo_content_cache')
      .select('url, title')
      .ilike('title', `%${keyword}%`)
      .eq('content_type', 'skill_page')
      .limit(2);
    
    skillPages?.forEach(page => {
      internalLinks.push({
        type: 'skill_page',
        anchor_text: `${keyword} skills`,
        target_url: page.url,
        context: 'skill_mention',
        priority: 'medium'
      });
    });
    
    // Link to learning content
    const { data: learningContent } = await supabase
      .from('seo_content_cache')
      .select('url, title')
      .ilike('title', `%${keyword}%`)
      .eq('content_type', 'learning')
      .limit(2);
    
    learningContent?.forEach(content => {
      internalLinks.push({
        type: 'learning_content',
        anchor_text: `Learn ${keyword}`,
        target_url: content.url,
        context: 'skill_development',
        priority: 'low'
      });
    });
  }

  // Store generated links
  const { error } = await supabase
    .from('generated_internal_links')
    .insert({
      content_type,
      content_id,
      generated_links: internalLinks,
      generated_at: new Date().toISOString(),
      status: 'pending_review'
    });

  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    generated_links: internalLinks,
    total_links: internalLinks.length
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function updateContentWithLinks(supabase: any, data: any) {
  const { content_type, content_id, approved_links } = data;
  
  console.log(`📝 Updating ${content_type} content with ${approved_links.length} links...`);
  
  let updateQuery;
  let contentField = 'description';
  
  switch (content_type) {
    case 'job':
      updateQuery = supabase.from('jobs');
      break;
    case 'company':
      updateQuery = supabase.from('companies');
      break;
    case 'blog_post':
      updateQuery = supabase.from('posts');
      contentField = 'content';
      break;
    default:
      throw new Error('Unsupported content type');
  }
  
  // Get current content
  const { data: currentContent } = await updateQuery
    .select(contentField)
    .eq('id', content_id)
    .single();
  
  let updatedContent = currentContent[contentField] || '';
  
  // Insert links strategically
  for (const link of approved_links) {
    if (link.priority === 'high') {
      // Add high priority links at the beginning or end
      const linkHtml = `<a href="${link.target_url}" class="internal-link" data-type="${link.type}">${link.anchor_text}</a>`;
      
      if (link.context === 'company_mention') {
        updatedContent = updatedContent.replace(
          new RegExp(link.anchor_text, 'gi'), 
          linkHtml
        );
      } else {
        updatedContent += `\n\n<p>Related: ${linkHtml}</p>`;
      }
    }
  }
  
  // Update content
  const { error } = await updateQuery
    .update({ 
      [contentField]: updatedContent,
      internal_links_updated: new Date().toISOString()
    })
    .eq('id', content_id);
  
  if (error) throw error;
  
  // Log link insertion
  await supabase.from('internal_link_logs').insert({
    content_type,
    content_id,
    links_added: approved_links.length,
    action: 'links_inserted',
    created_at: new Date().toISOString()
  });

  return new Response(JSON.stringify({
    success: true,
    updated_content: true,
    links_added: approved_links.length
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function trackLinkPerformance(supabase: any, data: any) {
  console.log('📈 Tracking internal link performance...');
  
  // Get link click data from analytics
  const { data: linkClicks } = await supabase
    .from('user_journey_tracking')
    .select('event_data, created_at')
    .eq('event_type', 'link_click')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
  
  const linkPerformance = {};
  
  linkClicks?.forEach(click => {
    const linkData = click.event_data;
    if (linkData.link_type === 'internal') {
      const key = `${linkData.from_page}_to_${linkData.to_page}`;
      if (!linkPerformance[key]) {
        linkPerformance[key] = {
          clicks: 0,
          from_page: linkData.from_page,
          to_page: linkData.to_page,
          link_text: linkData.link_text
        };
      }
      linkPerformance[key].clicks++;
    }
  });
  
  // Store performance data
  const performanceEntries = Object.values(linkPerformance);
  if (performanceEntries.length > 0) {
    await supabase.from('internal_link_performance').upsert(
      performanceEntries.map(entry => ({
        ...entry,
        date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      }))
    );
  }

  return new Response(JSON.stringify({
    success: true,
    performance_data: linkPerformance,
    tracked_links: performanceEntries.length
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  const techKeywords = [
    'javascript', 'python', 'java', 'react', 'node.js', 'aws', 'docker', 'kubernetes',
    'machine learning', 'data science', 'product manager', 'software engineer',
    'devops', 'frontend', 'backend', 'fullstack', 'ui/ux', 'designer',
    'bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune'
  ];
  
  const foundKeywords = [];
  const lowerText = text.toLowerCase();
  
  for (const keyword of techKeywords) {
    if (lowerText.includes(keyword)) {
      foundKeywords.push(keyword);
    }
  }
  
  return foundKeywords;
}

async function findLinkOpportunities(supabase: any, keywords: string[], contentType: string) {
  const opportunities = [];
  
  for (const keyword of keywords) {
    // Find related jobs
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, title, seo_slug')
      .or(`title.ilike.%${keyword}%, skills_required.cs.{${keyword}}`)
      .eq('is_active', true)
      .limit(3);
    
    jobs?.forEach(job => {
      opportunities.push({
        type: 'job',
        keyword,
        target_id: job.id,
        target_url: `/jobs/${job.seo_slug || job.id}`,
        target_title: job.title,
        relevance_score: 0.8
      });
    });
    
    // Find related companies
    if (contentType !== 'company') {
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name, slug')
        .ilike('description', `%${keyword}%`)
        .limit(2);
      
      companies?.forEach(company => {
        opportunities.push({
          type: 'company',
          keyword,
          target_id: company.id,
          target_url: `/companies/${company.slug || company.id}`,
          target_title: company.name,
          relevance_score: 0.6
        });
      });
    }
  }
  
  return opportunities.sort((a, b) => b.relevance_score - a.relevance_score);
}