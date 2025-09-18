import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentRequest {
  type?: 'job_description' | 'meta_tags' | 'blog_post' | 'landing_page' | 'company_description';
  contentType?: 'job_description' | 'meta_tags' | 'blog_post' | 'landing_page' | 'company_description';
  keywords?: string[];
  targetKeywords?: string[];
  targetCity?: string;
  industry?: string;
  jobTitle?: string;
  companyName?: string;
  tone?: 'professional' | 'casual' | 'technical';
  length?: 'short' | 'medium' | 'long';
  topic?: string;
  wordCount?: number;
}

interface GeneratedContent {
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  readabilityScore: number;
  seoScore: number;
  suggestions: string[];
}

async function generateSEOContent(request: ContentRequest): Promise<GeneratedContent> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log(`Generating ${request.type} content with keywords:`, request.keywords);

  try {
    let prompt = '';
    let systemPrompt = 'You are an expert SEO content writer specializing in job portals and career-related content for the Indian market.';

    switch (request.type) {
      case 'job_description':
        prompt = `Create an SEO-optimized job description for a ${request.jobTitle} position at ${request.companyName} in ${request.targetCity}. 
        Target keywords: ${request.keywords.join(', ')}
        
        Include:
        - Engaging job title and overview
        - Key responsibilities (5-7 points)
        - Required qualifications
        - Preferred skills
        - Benefits and company culture
        - Clear call-to-action
        
        Make it appealing to job seekers while optimizing for search engines. Use Indian English and include location-specific benefits.`;
        break;

      case 'meta_tags':
        prompt = `Generate SEO-optimized meta tags for a ${request.jobTitle} job page in ${request.targetCity}.
        Target keywords: ${request.keywords.join(', ')}
        
        Provide:
        1. Meta title (under 60 characters)
        2. Meta description (under 160 characters)
        3. H1 tag
        4. Additional keyword suggestions
        
        Focus on click-through rate optimization while maintaining keyword relevance.`;
        break;

      case 'blog_post':
        prompt = `Write an SEO-optimized blog post about career opportunities in ${request.industry} in ${request.targetCity}.
        Target keywords: ${request.keywords.join(', ')}
        
        Structure:
        - Compelling headline
        - Introduction with key statistics
        - Main sections with H2/H3 tags
        - Career growth insights
        - Salary expectations
        - Top companies hiring
        - Actionable tips for job seekers
        - Conclusion with call-to-action
        
        Length: ${request.length === 'long' ? '1500-2000' : request.length === 'medium' ? '800-1200' : '400-600'} words`;
        break;

      case 'landing_page':
        prompt = `Create SEO-optimized landing page content for ${request.jobTitle} jobs in ${request.targetCity}.
        Target keywords: ${request.keywords.join(', ')}
        
        Include:
        - Hero section with compelling headline
        - Benefits of finding jobs through TalentXcel
        - Job market overview for the role/city
        - Success stories snippet
        - Featured companies
        - Call-to-action sections
        - FAQ section
        
        Make it conversion-focused while maintaining SEO best practices.`;
        break;

      case 'company_description':
        prompt = `Write an SEO-optimized company description for ${request.companyName} in the ${request.industry} industry.
        Target keywords: ${request.keywords.join(', ')}
        
        Include:
        - Company overview and mission
        - Industry expertise and services
        - Work culture and values
        - Career opportunities
        - Employee benefits
        - Recent achievements or news
        - Why talent should join
        
        Keep it professional yet engaging for potential employees.`;
        break;
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: request.length === 'long' ? 2500 : request.length === 'medium' ? 1500 : 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Extract meta tags if it's a meta_tags request
    let metaTitle = '';
    let metaDescription = '';
    
    if (request.type === 'meta_tags') {
      const lines = generatedContent.split('\n');
      metaTitle = lines.find(line => line.toLowerCase().includes('meta title') || line.toLowerCase().includes('title:'))?.replace(/.*?:/, '').trim() || '';
      metaDescription = lines.find(line => line.toLowerCase().includes('meta description') || line.toLowerCase().includes('description:'))?.replace(/.*?:/, '').trim() || '';
    }

    // Calculate readability and SEO scores (simplified)
    const wordCount = generatedContent.split(' ').length;
    const sentenceCount = generatedContent.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / sentenceCount;
    
    const readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 2));
    
    // SEO score based on keyword usage and content structure
    const keywordDensity = request.keywords.reduce((total, keyword) => {
      const regex = new RegExp(keyword, 'gi');
      return total + (generatedContent.match(regex) || []).length;
    }, 0) / wordCount * 100;
    
    const seoScore = Math.min(100, (keywordDensity * 20) + 60);

    // Generate suggestions
    const suggestions = [
      keywordDensity < 1 ? 'Consider adding more target keywords naturally throughout the content' : '',
      avgWordsPerSentence > 20 ? 'Break down long sentences for better readability' : '',
      wordCount < 300 ? 'Consider expanding the content for better SEO performance' : '',
      !generatedContent.includes('TalentXcel') ? 'Include brand name naturally in the content' : '',
    ].filter(Boolean);

    return {
      content: generatedContent,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      keywords: request.keywords,
      readabilityScore: Math.round(readabilityScore),
      seoScore: Math.round(seoScore),
      suggestions,
    };

  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawRequest = await req.json();
    
    // Normalize the request to handle both formats
    const request: ContentRequest = {
      type: rawRequest.type || rawRequest.contentType,
      keywords: rawRequest.keywords || rawRequest.targetKeywords || [],
      targetCity: rawRequest.targetCity,
      industry: rawRequest.industry,
      jobTitle: rawRequest.jobTitle,
      companyName: rawRequest.companyName,
      tone: rawRequest.tone,
      length: rawRequest.length,
      topic: rawRequest.topic,
      wordCount: rawRequest.wordCount
    };
    
    if (!request.type || !request.keywords || request.keywords.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Content type and keywords are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Content generation requested: ${request.type}`);
    
    const result = await generateSEOContent(request);
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in AI SEO content generator:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate content' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});