// ============================================
// AI UNIFIED PROCESSOR EDGE FUNCTION - PHASE 3 BACKEND
// ============================================
// Backend processor for all AI operations with unified architecture

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl!, supabaseKey!);

interface AIRequest {
  operationType: 'resume_enhance' | 'job_match' | 'cover_letter' | 'interview_prep' | 'career_advice' | 'ats_optimize';
  inputData: any;
  targetRole?: string;
  options?: {
    priority?: 'low' | 'medium' | 'high';
    background?: boolean;
    responseFormat?: 'text' | 'json' | 'structured';
    maxTokens?: number;
    model?: string;
  };
  sessionId?: string;
  timestamp?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { operationType, inputData, targetRole, options, sessionId }: AIRequest = await req.json();
    const startTime = Date.now();

    console.log(`🤖 AI Unified Processor - Operation: ${operationType}`);
    console.log(`📊 Session: ${sessionId}, Priority: ${options?.priority || 'medium'}`);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Generate system prompt and user prompt based on operation type
    const { systemPrompt, userPrompt, model } = generatePrompts(operationType, inputData, targetRole, options);

    console.log(`🧠 Model: ${model}, Max Tokens: ${options?.maxTokens || 'default'}`);

    // Make OpenAI API request
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: options?.maxTokens || getDefaultMaxTokens(operationType),
        // Note: No temperature for newer models
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API Error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const aiResponse = await response.json();
    const processingTime = Date.now() - startTime;

    if (!aiResponse.choices || !aiResponse.choices[0]) {
      throw new Error('Invalid response from OpenAI API');
    }

    const rawContent = aiResponse.choices[0].message.content;
    console.log(`✅ AI Response generated in ${processingTime}ms`);

    // Process response based on operation type
    const processedData = processAIResponse(operationType, rawContent, options?.responseFormat);

    // Calculate cost estimate
    const costEstimate = calculateCost(
      aiResponse.usage?.prompt_tokens || 0,
      aiResponse.usage?.completion_tokens || 0,
      model
    );

    // Log to database if not background task
    if (!options?.background) {
      EdgeRuntime.waitUntil(logOperation(supabase, {
        operationType,
        inputData,
        outputData: processedData,
        processingTime,
        tokensUsed: aiResponse.usage?.total_tokens || 0,
        costEstimate,
        sessionId,
        success: true
      }));
    }

    const result = {
      success: true,
      data: processedData,
      processing_time: processingTime,
      tokens_used: aiResponse.usage?.total_tokens || 0,
      cost_estimate: costEstimate,
      confidence: calculateConfidence(operationType, processedData),
      recommendations: generateRecommendations(operationType, processedData),
      feedback_id: `${operationType}_${sessionId}_${Date.now()}`
    };

    console.log(`🎯 Operation completed successfully - Confidence: ${result.confidence}%`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 AI Unified Processor Error:', error);
    
    const errorResult = {
      success: false,
      error: error.message,
      processing_time: Date.now(),
      confidence: 0
    };

    return new Response(JSON.stringify(errorResult), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generatePrompts(operationType: string, inputData: any, targetRole?: string, options?: any) {
  const model = options?.model || 'gpt-5-mini-2025-08-07'; // Use GPT-5 mini for efficiency
  
  switch (operationType) {
    case 'resume_enhance':
      return {
        systemPrompt: `You are an expert resume enhancement specialist with deep knowledge of ATS systems, industry best practices, and modern hiring trends. Your goal is to improve resume content while maintaining factual accuracy and professional tone.`,
        userPrompt: `Enhance this resume data for better professional presentation and ATS optimization:

Resume Data: ${JSON.stringify(inputData.resumeData)}
Target Role: ${targetRole || 'general professional role'}
Enhancement Type: ${inputData.enhancementType || 'professional'}
Sections to Focus: ${inputData.sections?.join(', ') || 'all sections'}
${inputData.jobDescription ? `Job Description Context: ${inputData.jobDescription}` : ''}

Please return a JSON response with:
{
  "enhanced_sections": {
    "section_name": {
      "original": "original content",
      "enhanced": "improved content", 
      "improvements": ["list of specific improvements made"]
    }
  },
  "ats_score": {
    "overall": 85,
    "keyword_density": 90,
    "formatting": 80,
    "structure": 85
  },
  "suggestions": ["actionable improvement suggestions"],
  "keywords_to_add": ["relevant keywords to incorporate"]
}`,
        model
      };

    case 'job_match':
      return {
        systemPrompt: `You are an AI career matching specialist with expertise in analyzing job requirements, candidate profiles, and calculating compatibility scores. You excel at identifying skill gaps and matching factors.`,
        userPrompt: `Analyze the compatibility between this candidate's resume and the provided job descriptions:

Candidate Resume: ${JSON.stringify(inputData.resumeData)}
Job Descriptions: ${JSON.stringify(inputData.jobDescriptions)}

For each job, provide a compatibility analysis including:
- Match score (0-100)
- Matching factors (what aligns well)
- Skill gaps (what's missing)
- Salary comparison insights
- Specific recommendations

Return as JSON array of job matches.`,
        model
      };

    case 'cover_letter':
      return {
        systemPrompt: `You are a professional cover letter writer specializing in creating compelling, personalized cover letters that showcase candidate strengths and align with job requirements.`,
        userPrompt: `Create a ${inputData.tone || 'professional'} cover letter based on:

Resume Data: ${JSON.stringify(inputData.resumeData)}
Job Information: ${JSON.stringify(inputData.jobData)}
Length: ${inputData.length || 'medium'}
Include Call to Action: ${inputData.includeCallToAction !== false}

Return JSON with: content, sections (opening/body/closing), tone, customization_notes`,
        model
      };

    case 'interview_prep':
      return {
        systemPrompt: `You are an experienced interview coach specializing in helping candidates prepare for various types of interviews with relevant questions, answers, and strategic advice.`,
        userPrompt: `Generate interview preparation materials:

Candidate Resume: ${JSON.stringify(inputData.resumeData)}
Job Details: ${JSON.stringify(inputData.jobData)}
Question Count: ${inputData.questionCount || 10}
Difficulty: ${inputData.difficulty || 'medium'}
Interview Type: ${inputData.jobData.interviewType || 'general'}

Provide relevant interview questions, suggested answers, tips, and company insights.`,
        model
      };

    case 'career_advice':
      return {
        systemPrompt: `You are a senior career advisor with extensive knowledge of career paths, skill development, market trends, and professional growth strategies across various industries.`,
        userPrompt: `Provide comprehensive career advice based on:

Current Profile: ${JSON.stringify(inputData.resumeData)}
Career Goals: ${JSON.stringify(inputData.careerGoals)}

Include:
- Potential career paths
- Skill recommendations with importance levels
- Market insights and trends
- Actionable next steps

${inputData.includeSkillGaps ? 'Include detailed skill gap analysis.' : ''}
${inputData.includeMarketInsights ? 'Include current market insights and salary trends.' : ''}
${inputData.includeNetworkingTips ? 'Include networking strategies and tips.' : ''}`,
        model
      };

    case 'ats_optimize':
      return {
        systemPrompt: `You are an ATS (Applicant Tracking System) optimization expert with deep knowledge of how ATS systems parse resumes and what elements contribute to higher scores.`,
        userPrompt: `Optimize this resume for ATS compatibility:

Resume Data: ${JSON.stringify(inputData.resumeData)}
Job Description: ${inputData.jobDescription}
Target ATS Score: ${inputData.targetScore || 85}

Provide:
- Optimized resume with improved keyword density
- Current vs potential ATS scores
- Specific keyword suggestions with importance and frequency recommendations
- Formatting improvements for better ATS parsing`,
        model
      };

    default:
      throw new Error(`Unsupported operation type: ${operationType}`);
  }
}

function processAIResponse(operationType: string, rawContent: string, responseFormat?: string) {
  try {
    // Try to parse as JSON first
    const jsonContent = JSON.parse(rawContent);
    return jsonContent;
  } catch {
    // If JSON parsing fails, return structured text response
    return {
      content: rawContent,
      type: 'text',
      operation: operationType
    };
  }
}

function getDefaultMaxTokens(operationType: string): number {
  const tokenLimits = {
    'resume_enhance': 2000,
    'job_match': 1500,
    'cover_letter': 1000,
    'interview_prep': 2500,
    'career_advice': 2000,
    'ats_optimize': 2000
  };
  
  return tokenLimits[operationType as keyof typeof tokenLimits] || 1500;
}

function calculateCost(promptTokens: number, completionTokens: number, model: string): number {
  // Cost per 1M tokens for GPT-5 mini (example rates)
  const rates = {
    'gpt-5-mini-2025-08-07': { input: 0.15, output: 0.60 },
    'gpt-5-2025-08-07': { input: 2.50, output: 10.00 },
    'gpt-4.1-2025-04-14': { input: 2.50, output: 10.00 }
  };
  
  const rate = rates[model as keyof typeof rates] || rates['gpt-5-mini-2025-08-07'];
  
  return ((promptTokens * rate.input) + (completionTokens * rate.output)) / 1000000;
}

function calculateConfidence(operationType: string, processedData: any): number {
  // Basic confidence calculation based on operation type and data quality
  if (!processedData || typeof processedData !== 'object') {
    return 60; // Low confidence for text-only responses
  }

  switch (operationType) {
    case 'resume_enhance':
      return processedData.enhanced_sections && Object.keys(processedData.enhanced_sections).length > 0 ? 85 : 70;
    case 'job_match':
      return Array.isArray(processedData) && processedData.length > 0 ? 90 : 65;
    case 'cover_letter':
      return processedData.content && processedData.sections ? 88 : 75;
    case 'interview_prep':
      return processedData.questions && Array.isArray(processedData.questions) ? 87 : 72;
    case 'career_advice':
      return processedData.career_paths && processedData.skill_recommendations ? 85 : 70;
    case 'ats_optimize':
      return processedData.optimized_resume && processedData.ats_score ? 92 : 75;
    default:
      return 75;
  }
}

function generateRecommendations(operationType: string, processedData: any): string[] {
  const recommendations: string[] = [];
  
  switch (operationType) {
    case 'resume_enhance':
      recommendations.push('Review the enhanced sections and apply changes that align with your experience');
      recommendations.push('Consider incorporating suggested keywords naturally into your content');
      break;
    case 'job_match':
      recommendations.push('Focus on the highest-matching opportunities first');
      recommendations.push('Address skill gaps through learning or project experience');
      break;
    case 'cover_letter':
      recommendations.push('Customize the opening paragraph for each application');
      recommendations.push('Review and personalize the content before sending');
      break;
    case 'interview_prep':
      recommendations.push('Practice your answers aloud before the interview');
      recommendations.push('Research the company culture and recent news');
      break;
    case 'career_advice':
      recommendations.push('Start with the highest-impact skill recommendations');
      recommendations.push('Consider informational interviews in your target areas');
      break;
    case 'ats_optimize':
      recommendations.push('Test your optimized resume with online ATS scanners');
      recommendations.push('Maintain keyword density while keeping content natural');
      break;
  }
  
  return recommendations;
}

async function logOperation(supabase: any, logData: any) {
  try {
    await supabase.from('ai_usage_logs').insert({
      operation_type: logData.operationType,
      request_data: logData.inputData,
      response_data: logData.outputData,
      processing_time: logData.processingTime,
      tokens_used: logData.tokensUsed,
      cost_estimate: logData.costEstimate,
      session_id: logData.sessionId,
      status: logData.success ? 'success' : 'error',
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log operation:', error);
  }
}