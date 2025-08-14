import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PrefillRequest {
  module: string;
  userContext: {
    id?: string;
    name?: string;
    role?: string;
    industry?: string;
    experience_years?: number;
    location?: string;
    email?: string;
    skills?: string[];
    interests?: string[];
  };
  generateType: 'comprehensive' | 'basic' | 'suggestions';
  contentType?: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { module, userContext, generateType, contentType }: PrefillRequest = await req.json();

    console.log('AI Prefill Generator called:', { module, generateType, contentType });

    // Get user profile data if user ID provided
    let fullUserContext = userContext;
    if (userContext.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, headline, location, primary_role, industry')
        .eq('id', userContext.id)
        .single();

      if (profile) {
        fullUserContext = {
          ...userContext,
          name: profile.full_name,
          email: profile.email,
          role: profile.primary_role || profile.headline,
          location: profile.location,
          industry: profile.industry,
        };
      }
    }

    // Create content hash for caching
    const contentHash = await crypto.subtle.digest(
      'SHA-256', 
      new TextEncoder().encode(JSON.stringify({ module, fullUserContext, generateType, contentType }))
    );
    const hashString = Array.from(new Uint8Array(contentHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Check cache first
    const { data: cached } = await supabase
      .from('ai_prefill_cache')
      .select('generated_content, usage_count')
      .eq('content_hash', hashString)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (cached) {
      console.log('Using cached AI content');
      // Update usage count
      await supabase
        .from('ai_prefill_cache')
        .update({ usage_count: cached.usage_count + 1 })
        .eq('content_hash', hashString);

      return new Response(JSON.stringify(cached.generated_content), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get module defaults
    const { data: defaults } = await supabase
      .from('module_defaults')
      .select('template_data')
      .eq('module_name', module)
      .eq('is_active', true);

    // Generate AI content based on module and context
    const aiContent = await generateModuleContent(module, fullUserContext, generateType, contentType, defaults);

    // Cache the result
    await supabase
      .from('ai_prefill_cache')
      .insert({
        content_hash: hashString,
        input_context: fullUserContext,
        generated_content: aiContent,
        module_name: module,
        usage_count: 1
      });

    // Update user's prefill cache
    if (userContext.id) {
      await supabase
        .from('user_prefill_cache')
        .upsert({
          user_id: userContext.id,
          module_name: module,
          prefill_data: aiContent,
          ai_generated_at: new Date().toISOString(),
          usage_count: 1
        });
    }

    console.log('Generated new AI content for module:', module);

    return new Response(JSON.stringify(aiContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in AI prefill generator:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

async function generateModuleContent(
  module: string, 
  userContext: any, 
  generateType: string, 
  contentType?: string,
  defaults?: any[]
): Promise<any> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.log('No OpenAI API key, using template-based generation');
    return generateTemplateBasedContent(module, userContext, defaults);
  }

  const prompts = {
    network: {
      comprehensive: `Generate a professional network profile introduction for ${userContext.name || 'a professional'}, a ${userContext.role || 'professional'} with ${userContext.experience_years || 2} years of experience in ${userContext.industry || 'their field'}. Include:
- A compelling bio (2-3 sentences)
- 5 connection message templates
- 3 relevant group suggestions
- Professional interests and topics to discuss
Return as JSON with keys: bio, connectionMessages, groupSuggestions, interests`,
      
      basic: `Create a brief professional bio for ${userContext.name || 'a professional'} in ${userContext.industry || 'their industry'}. Keep it engaging and professional.`
    },
    
    resume: {
      comprehensive: `Generate resume content for ${userContext.name || 'a professional'}, a ${userContext.role || 'professional'} in ${userContext.industry || 'their field'}. Include:
- Professional summary (3-4 lines)
- 8-10 relevant skills for their industry
- 3 sample achievement bullet points
- 2 certification suggestions
Return as JSON with keys: summary, skills, achievements, certifications`,
      
      basic: `Write a professional summary for a ${userContext.role || 'professional'} resume in ${userContext.industry || 'their field'}.`
    },
    
    jobs: {
      comprehensive: `Generate job search content for ${userContext.name || 'a professional'} looking for ${userContext.role || 'professional'} roles in ${userContext.industry || 'their industry'}. Include:
- Optimized search keywords
- Cover letter template
- Application tracking preferences
- Interview preparation tips specific to their role
Return as JSON with keys: searchKeywords, coverLetterTemplate, trackingPrefs, interviewTips`
    },
    
    learning: {
      comprehensive: `Create a learning roadmap for ${userContext.name || 'a professional'} to advance from ${userContext.role || 'their current role'} in ${userContext.industry || 'their industry'}. Include:
- 5 recommended courses
- Learning timeline (6-12 months)
- Skill priorities
- Career milestones
Return as JSON with keys: courses, timeline, skillPriorities, milestones`
    },
    
    career_map: {
      comprehensive: `Design a 5-year career progression plan for ${userContext.name || 'a professional'} currently working as ${userContext.role || 'a professional'} in ${userContext.industry || 'their industry'}. Include:
- Year-by-year milestones
- Skills to develop each year
- Target roles and salary progression
- Recommended certifications and courses
Return as JSON with keys: yearlyMilestones, skillDevelopment, targetRoles, salaryProgression, recommendedCerts`
    }
  };

  const prompt = prompts[module as keyof typeof prompts]?.[generateType as keyof any] || 
    `Generate helpful content for the ${module} module for a ${userContext.role || 'professional'} in ${userContext.industry || 'their field'}.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert career advisor and content generator. Always return valid JSON when requested, and make content personalized and actionable.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data: OpenAIResponse = await response.json();
    const content = data.choices[0]?.message?.content;

    // Try to parse as JSON, fallback to text
    try {
      return JSON.parse(content);
    } catch {
      return { content: content };
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return generateTemplateBasedContent(module, userContext, defaults);
  }
}

function generateTemplateBasedContent(module: string, userContext: any, defaults?: any[]): any {
  const templateContent = defaults?.[0]?.template_data || {};
  
  // Replace placeholders with user context
  const replacePlaceholders = (text: string): string => {
    return text
      .replace(/\{\{name\}\}/g, userContext.name || 'Professional')
      .replace(/\{\{role\}\}/g, userContext.role || 'Professional')
      .replace(/\{\{industry\}\}/g, userContext.industry || 'Technology')
      .replace(/\{\{experience_years\}\}/g, (userContext.experience_years || 2).toString())
      .replace(/\{\{location\}\}/g, userContext.location || 'Location')
      .replace(/\{\{email\}\}/g, userContext.email || 'email@example.com');
  };

  // Process template content recursively
  const processContent = (obj: any): any => {
    if (typeof obj === 'string') {
      return replacePlaceholders(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(processContent);
    } else if (typeof obj === 'object' && obj !== null) {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = processContent(value);
      }
      return result;
    }
    return obj;
  };

  return processContent(templateContent);
}

serve(handler);