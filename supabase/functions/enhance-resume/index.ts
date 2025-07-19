import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeId, sectionType, content, enhancementType } = await req.json();
    
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ 
        error: 'AI enhancement not available' 
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate enhancement based on type
    let enhancedContent;
    switch (enhancementType) {
      case 'keyword_optimization':
        enhancedContent = await optimizeKeywords(content, sectionType);
        break;
      case 'format_improvement':
        enhancedContent = await improveFormatting(content, sectionType);
        break;
      case 'content_enhancement':
        enhancedContent = await enhanceContent(content, sectionType);
        break;
      case 'ats_optimization':
        enhancedContent = await optimizeForATS(content, sectionType);
        break;
      default:
        enhancedContent = await enhanceContent(content, sectionType);
    }

    // Calculate confidence score
    const confidenceScore = calculateConfidenceScore(content, enhancedContent);

    // Save enhancement suggestion
    const { data: enhancement, error } = await supabase
      .from('ai_resume_enhancements')
      .insert({
        resume_id: resumeId,
        section_type: sectionType,
        original_content: typeof content === 'string' ? content : JSON.stringify(content),
        enhanced_content: typeof enhancedContent === 'string' ? enhancedContent : JSON.stringify(enhancedContent),
        enhancement_type: enhancementType,
        confidence_score: confidenceScore
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      enhancement,
      enhancedContent,
      confidenceScore
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error enhancing resume:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to enhance resume' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function optimizeKeywords(content: any, sectionType: string): Promise<string> {
  const prompt = getPromptForSection(sectionType, 'keyword_optimization', content);
  return await callOpenAI(prompt);
}

async function improveFormatting(content: any, sectionType: string): Promise<string> {
  const prompt = getPromptForSection(sectionType, 'format_improvement', content);
  return await callOpenAI(prompt);
}

async function enhanceContent(content: any, sectionType: string): Promise<string> {
  const prompt = getPromptForSection(sectionType, 'content_enhancement', content);
  return await callOpenAI(prompt);
}

async function optimizeForATS(content: any, sectionType: string): Promise<string> {
  const prompt = getPromptForSection(sectionType, 'ats_optimization', content);
  return await callOpenAI(prompt);
}

function getPromptForSection(sectionType: string, enhancementType: string, content: any): string {
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
  
  const basePrompts = {
    summary: {
      keyword_optimization: `Optimize this professional summary with relevant industry keywords while maintaining natural flow:
${contentStr}

Return only the enhanced summary:`,
      
      content_enhancement: `Rewrite this professional summary to be more impactful, quantified, and compelling:
${contentStr}

Return only the enhanced summary:`,
      
      ats_optimization: `Optimize this summary for ATS systems with proper keywords and formatting:
${contentStr}

Return only the ATS-optimized summary:`
    },
    
    experience: {
      keyword_optimization: `Add relevant industry keywords to these work experiences while keeping them truthful:
${contentStr}

Return only the enhanced experiences in the same JSON format:`,
      
      content_enhancement: `Rewrite these work experiences with stronger action verbs, quantified achievements, and impact metrics:
${contentStr}

Return only the enhanced experiences in the same JSON format:`,
      
      format_improvement: `Improve the formatting and bullet point structure of these work experiences:
${contentStr}

Return only the improved experiences in the same JSON format:`
    },
    
    skills: {
      keyword_optimization: `Expand and optimize this skills list with relevant industry keywords and technologies:
${contentStr}

Return only the enhanced skills list:`,
      
      content_enhancement: `Categorize and enhance this skills list for better presentation:
${contentStr}

Return only the enhanced skills list:`
    }
  };

  return basePrompts[sectionType]?.[enhancementType] || 
    `Enhance this ${sectionType} content for a professional resume:
${contentStr}

Return only the enhanced content:`;
}

async function callOpenAI(prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
          content: 'You are a professional resume writing expert. Provide clear, impactful improvements that help candidates stand out while remaining truthful.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

function calculateConfidenceScore(original: any, enhanced: any): number {
  // Simple confidence calculation based on content length and improvement
  const originalLength = JSON.stringify(original).length;
  const enhancedLength = JSON.stringify(enhanced).length;
  
  if (enhancedLength > originalLength * 1.2 && enhancedLength < originalLength * 3) {
    return 0.85; // High confidence for reasonable enhancements
  } else if (enhancedLength > originalLength) {
    return 0.70; // Medium confidence
  } else {
    return 0.55; // Lower confidence for minimal changes
  }
}