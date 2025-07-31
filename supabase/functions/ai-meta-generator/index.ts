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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { type, data, bulk = false } = await req.json();
    
    console.log(`🎯 Generating SEO meta tags for ${type}${bulk ? ' (bulk mode)' : ''}`);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let result;
    
    if (bulk) {
      result = await generateBulkMetaTags(type, data, openAIApiKey);
    } else {
      result = await generateSingleMetaTags(type, data, openAIApiKey);
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Meta tag generation error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateSingleMetaTags(type: string, data: any, apiKey: string) {
  const prompt = createPromptForType(type, data);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: `You are an expert SEO copywriter for TalentXcel, India's premier career platform. Create compelling, keyword-rich meta titles and descriptions that:
          
          1. Maximize click-through rates
          2. Include relevant keywords naturally
          3. Follow Google's best practices (titles 50-60 chars, descriptions 150-160 chars)
          4. Include location, salary, or other key details when available
          5. Use action words and urgency when appropriate
          6. Always include "TalentXcel" in titles for brand recognition

          Return ONLY a JSON object with "title" and "description" fields. No other text.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    }),
  });

  const aiResult = await response.json();
  const metaTags = JSON.parse(aiResult.choices[0].message.content);
  
  console.log(`✅ Generated meta tags for ${type}: ${metaTags.title}`);
  
  return {
    title: metaTags.title,
    description: metaTags.description,
    type,
    generated_at: new Date().toISOString()
  };
}

async function generateBulkMetaTags(type: string, items: any[], apiKey: string) {
  const batchSize = 5; // Process in batches to avoid rate limits
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises = batch.map(item => generateSingleMetaTags(type, item, apiKey));
    
    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Rate limiting: wait 1 second between batches
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`❌ Batch ${i / batchSize + 1} failed:`, error);
      // Continue with next batch
    }
  }
  
  console.log(`✅ Generated ${results.length}/${items.length} meta tags in bulk`);
  
  return {
    results,
    total_processed: results.length,
    total_requested: items.length,
    success_rate: (results.length / items.length * 100).toFixed(1) + '%'
  };
}

function createPromptForType(type: string, data: any): string {
  switch (type) {
    case 'job':
      return `Create SEO meta tags for this job posting:
      
      Job Title: ${data.title}
      Company: ${data.company_name || data.company?.name || 'Leading Company'}
      Location: ${data.location || 'India'}
      Employment Type: ${data.employment_type || 'Full-time'}
      Salary: ${data.salary_min && data.salary_max ? `₹${data.salary_min/100000}L - ₹${data.salary_max/100000}L` : 'Competitive'}
      Skills: ${data.skills?.slice(0, 3).join(', ') || 'Multiple skills'}
      
      Focus on: Job title, company, location, salary range, and include "Apply Now" or urgency.`;

    case 'company':
      return `Create SEO meta tags for this company profile:
      
      Company: ${data.name}
      Industry: ${data.industry || 'Technology'}
      Location: ${data.location || 'India'}
      Size: ${data.size || 'Growing team'}
      Description: ${data.description?.substring(0, 200) || 'Innovative company'}
      
      Focus on: Company name, industry, location, and career opportunities.`;

    case 'course':
      return `Create SEO meta tags for this learning course:
      
      Course: ${data.title}
      Instructor: ${data.instructor || 'Expert Instructor'}
      Duration: ${data.duration || 'Self-paced'}
      Level: ${data.level || 'All levels'}
      Price: ${data.price ? `₹${data.price}` : 'Free'}
      Skills: ${data.skills?.slice(0, 3).join(', ') || 'Professional skills'}
      
      Focus on: Course benefits, skills gained, instructor credibility, and learning outcomes.`;

    case 'profile':
      return `Create SEO meta tags for this professional profile:
      
      Name: ${data.full_name || data.name}
      Title: ${data.headline || data.title || 'Professional'}
      Location: ${data.location || 'India'}
      Experience: ${data.experience_years || 'Experienced'} years
      Skills: ${data.skills?.slice(0, 3).join(', ') || 'Multiple skills'}
      
      Focus on: Professional expertise, location, and networking potential.`;

    case 'tool':
      return `Create SEO meta tags for this AI tool:
      
      Tool: ${data.name}
      Description: ${data.description}
      Category: ${data.category || 'Career Tool'}
      Features: ${data.features?.slice(0, 3).join(', ') || 'AI-powered features'}
      
      Focus on: Tool benefits, AI capabilities, and professional outcomes.`;

    default:
      return `Create SEO meta tags for this ${type} content:
      
      Title: ${data.title || data.name}
      Description: ${data.description || data.content?.substring(0, 200)}
      
      Focus on: Main benefits and value proposition for professionals.`;
  }
}