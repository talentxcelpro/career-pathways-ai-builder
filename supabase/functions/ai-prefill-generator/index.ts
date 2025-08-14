import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";
import { corsHeaders } from "../_shared/cors.ts";

interface PrefillRequest {
  name?: string;
  user?: { id?: string };
  user_id?: string;
  module?: string;
  generateType?: 'comprehensive' | 'basic' | 'suggestions';
  contentType?: string;
  userContext?: Record<string, any>;
  data?: Record<string, any>;
}

interface PrefillResponse {
  id: string;
  module: string;
  user_id: string;
  data: Record<string, any>;
  generated_at: string;
  success: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body safely
    let body: PrefillRequest;
    try {
      body = await req.json();
    } catch (err) {
      console.error("Invalid JSON:", err);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Request body:", body);

    // Enhanced safe extraction with role-awareness and multi-module support
    const module = body.module || "network";
    const generateType = body.generateType || "basic";
    const contentType = body.contentType || "";
    
    // Enhanced user context extraction with role detection
    const userContext = body.userContext || {};
    const userId = userContext?.id || body.user?.id || body.user_id || "anonymous";
    const userName = userContext?.name || body.name || "Professional";
    
    // Role-aware detection logic
    const detectRole = (name: string, context: any): string => {
      const nameLC = (name || '').toLowerCase();
      if (nameLC.includes('cto') || nameLC.includes('chief technology')) return 'CTO';
      if (nameLC.includes('ceo') || nameLC.includes('chief executive')) return 'CEO';
      if (nameLC.includes('manager') || nameLC.includes('lead')) return 'Manager';
      if (nameLC.includes('senior') || nameLC.includes('sr.')) return 'Senior Professional';
      if (nameLC.includes('developer') || nameLC.includes('engineer')) return 'Developer';
      if (context?.role) return context.role;
      return 'Professional';
    };
    
    const userRole = detectRole(userName, userContext) || userContext?.role || "Professional";
    const userIndustry = userContext?.industry || "Technology";
    const userExperience = userContext?.experience_years || 2;
    const userLocation = userContext?.location || "Remote";
    const userEmail = userContext?.email || `${userName.toLowerCase().replace(/\s+/g, '.')}@example.com`;

    console.log("Parsed data:", { 
      module, 
      generateType, 
      userId, 
      userName, 
      userRole, 
      userIndustry,
      roleDetected: detectRole(userName, userContext)
    });

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Generate AI prefill content
    let prefillResult: any;
    try {
      prefillResult = await generatePrefillContent({
        module,
        generateType,
        contentType,
        userContext: {
          id: userId,
          name: userName,
          role: userRole,
          industry: userIndustry,
          experience_years: userExperience,
          location: userLocation,
          email: userEmail,
        },
        supabase
      });
    } catch (err) {
      console.error("AI prefill generation failed:", err);
      // Safe fallback prefill
      prefillResult = generateFallbackPrefill(module, userName, userRole, userIndustry);
    }

    // Safe final prefill object with guaranteed properties
    const finalPrefill = {
      id: prefillResult?.id || crypto.randomUUID(),
      module: module,
      user_id: userId,
      data: prefillResult?.data || prefillResult || {},
      generated_at: new Date().toISOString(),
      success: true
    };

    console.log("Generated prefill:", finalPrefill);

    // Cache the result if we have a real user
    if (userId !== "anonymous") {
      try {
        await supabase
          .from('user_prefill_cache')
          .upsert({
            user_id: userId,
            module_name: module,
            prefill_data: finalPrefill.data,
            ai_generated_at: finalPrefill.generated_at,
            usage_count: 1
          });
      } catch (cacheError) {
        console.error("Cache save failed:", cacheError);
        // Continue anyway - don't fail the request
      }
    }

    return new Response(
      JSON.stringify(finalPrefill),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Unexpected error in AI prefill generator:", err);
    return new Response(
      JSON.stringify({ 
        error: "Internal Server Error", 
        details: err.message,
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

async function generatePrefillContent(params: {
  module: string;
  generateType: string;
  contentType: string;
  userContext: any;
  supabase: any;
}): Promise<any> {
  const { module, generateType, userContext, supabase } = params;
  
  console.log(`Generating ${generateType} content for ${module} module`);

  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.log('No OpenAI API key, using template-based generation');
    return generateTemplateBasedContent(module, userContext, supabase);
  }

  // AI prompts for different modules
  const prompts: Record<string, Record<string, string>> = {
    network: {
      comprehensive: `Generate professional networking content for ${userContext.name}, a ${userContext.role} with ${userContext.experience_years} years in ${userContext.industry}. Include:
- Professional bio (2-3 sentences)
- 5 connection message templates
- 3 relevant group suggestions
- Professional interests
Return as JSON with keys: bio, connectionMessages, groupSuggestions, interests`,
      basic: `Create a brief professional bio for ${userContext.name}, a ${userContext.role} in ${userContext.industry}.`
    },
    resume: {
      comprehensive: `Generate resume content for ${userContext.name}, a ${userContext.role} in ${userContext.industry}. Include:
- Professional summary (3-4 lines)
- 8-10 relevant skills
- 3 achievement examples
- 2 certification suggestions
Return as JSON with keys: summary, skills, achievements, certifications`,
      basic: `Write a professional summary for a ${userContext.role} resume in ${userContext.industry}.`
    },
    jobs: {
      comprehensive: `Generate job search content for ${userContext.name} seeking ${userContext.role} roles in ${userContext.industry}. Include:
- Search keywords
- Cover letter template
- Application preferences
- Interview tips
Return as JSON with keys: searchKeywords, coverLetterTemplate, trackingPrefs, interviewTips`
    }
  };

  const prompt = prompts[module]?.[generateType] || 
    `Generate helpful content for the ${module} module for a ${userContext.role} in ${userContext.industry}.`;

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
            content: 'You are an expert career advisor. Always return valid JSON when requested.'
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

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Try to parse as JSON, fallback to text
    try {
      return JSON.parse(content);
    } catch {
      return { content: content };
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return generateTemplateBasedContent(module, userContext, null);
  }
}

async function generateTemplateBasedContent(module: string, userContext: any, supabase: any): Promise<any> {
  console.log(`Generating template-based content for ${module}`);
  
  // Get module defaults if supabase is available
  let defaults: any[] = [];
  if (supabase) {
    try {
      const { data } = await supabase
        .from('module_defaults')
        .select('template_data')
        .eq('module_name', module)
        .eq('is_active', true);
      defaults = data || [];
    } catch (error) {
      console.error('Error fetching defaults:', error);
    }
  }

  const templateContent = defaults?.[0]?.template_data || getFallbackTemplate(module);
  
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

function getFallbackTemplate(module: string): any {
  const templates: Record<string, any> = {
    network: {
      bio: "{{name}} is a dedicated {{role}} with {{experience_years}} years of experience in {{industry}}.",
      connectionMessages: [
        "Hi {{name}}, I'd love to connect and learn more about your experience in {{industry}}.",
        "Hello! I noticed we both work in {{industry}}. Would love to connect!",
        "Hi {{name}}, I'm interested in connecting with fellow {{role}} professionals."
      ],
      interests: ["Professional Development", "Industry Trends", "Networking"]
    },
    resume: {
      summary: "Experienced {{role}} with {{experience_years}} years in {{industry}}. Passionate about delivering results and continuous learning.",
      skills: ["Communication", "Leadership", "Problem Solving", "Team Collaboration"],
      achievements: ["Led successful projects", "Improved team efficiency", "Delivered quality results"]
    },
    jobs: {
      searchKeywords: ["{{role}}", "{{industry}}", "Professional"],
      coverLetterTemplate: "Dear Hiring Manager, I am excited to apply for the {{role}} position...",
      interviewTips: ["Research the company", "Prepare examples", "Ask thoughtful questions"]
    }
  };

  return templates[module] || { content: "Default content for {{name}} in {{industry}}" };
}

function generateFallbackPrefill(module: string, name: string, role: string, industry: string): any {
  console.log(`Generating fallback prefill for ${module}`);
  
  return {
    id: crypto.randomUUID(),
    data: getFallbackTemplate(module),
    generated_at: new Date().toISOString(),
    fallback: true
  };
}