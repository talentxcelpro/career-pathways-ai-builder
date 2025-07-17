
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log(`Keyword optimizer called: ${req.method} from ${req.headers.get('Origin')}`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { resumeContent, jobDescription, targetRole, industry } = requestBody;

    console.log('Optimizing keywords for:', { targetRole, industry, hasResumeContent: !!resumeContent });

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'OpenAI API key not configured. Please contact support.',
          atsScore: 0,
          keywordAnalysis: {
            matched: [],
            missing: [],
            density: 0,
            distribution: "api_key_missing"
          },
          recommendations: [{
            keyword: "API Configuration Required",
            priority: "high",
            suggestion: "Please contact support to configure OpenAI API key",
            naturalIntegration: "API key configuration needed for keyword optimization",
            section: "system"
          }],
          optimizedSections: {
            summary: "OpenAI API key required for optimization",
            skills: "API key configuration needed",
            experience: "Please contact support for API setup"
          },
          industryKeywords: {
            technical: [],
            soft: [],
            industry: []
          },
          improvementTips: [
            "Please contact support to configure the OpenAI API key",
            "This service requires proper API configuration",
            "Once configured, you'll get detailed keyword optimization"
          ]
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Handle null or undefined resume content
    if (!resumeContent) {
      console.log('No resume content provided, returning default response');
      return new Response(
        JSON.stringify({ 
          success: true,
          atsScore: 0,
          keywordAnalysis: {
            matched: [],
            missing: [],
            density: 0,
            distribution: "needs_content"
          },
          recommendations: [{
            keyword: "Resume Content Required",
            priority: "high",
            suggestion: "Please upload or provide resume content first",
            naturalIntegration: "Upload your resume to get keyword optimization recommendations",
            section: "general"
          }],
          optimizedSections: {
            summary: "Please provide resume content for optimization",
            skills: "Upload resume to analyze skills section",
            experience: "Resume content needed for experience optimization"
          },
          industryKeywords: {
            technical: [],
            soft: [],
            industry: []
          },
          improvementTips: [
            "Upload your resume first to get personalized keyword optimization",
            "Provide a job description for better keyword matching",
            "Specify your target role and industry for tailored recommendations"
          ]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) optimizer with deep knowledge of keyword matching and resume optimization.

TASK: Analyze the resume content against the job description and provide comprehensive keyword optimization recommendations.

ANALYSIS REQUIREMENTS:
1. Extract key skills, technologies, and qualifications from the job description
2. Identify missing keywords in the resume that match the job requirements
3. Suggest natural ways to incorporate missing keywords
4. Analyze keyword density and distribution
5. Provide ATS compatibility score and recommendations
6. Suggest industry-specific terms and phrases

OPTIMIZATION PRINCIPLES:
- Keywords should be naturally integrated, not stuffed
- Focus on exact matches for technical skills and tools
- Include variations and synonyms of key terms
- Prioritize hard skills over soft skills for ATS matching
- Maintain readability and professional tone

Return a JSON object with this structure:
{
  "atsScore": 75,
  "keywordAnalysis": {
    "matched": ["keyword1", "keyword2"],
    "missing": ["keyword3", "keyword4"],
    "density": 0.12,
    "distribution": "good"
  },
  "recommendations": [
    {
      "keyword": "Python",
      "priority": "high",
      "suggestion": "Add to technical skills section",
      "naturalIntegration": "Include in a specific project description",
      "section": "skills"
    }
  ],
  "optimizedSections": {
    "summary": "Optimized summary with better keywords",
    "skills": "Optimized skills section",
    "experience": "Optimized experience descriptions"
  },
  "industryKeywords": {
    "technical": ["React", "Node.js", "AWS"],
    "soft": ["Leadership", "Collaboration"],
    "industry": ["Agile", "DevOps", "CI/CD"]
  },
  "improvementTips": [
    "Add specific technology versions",
    "Include industry certifications",
    "Use action verbs that match job description"
  ]
}`;

    const userPrompt = `Optimize ATS keywords for this resume:

TARGET ROLE: ${targetRole || 'Not specified'}
INDUSTRY: ${industry || 'Not specified'}

JOB DESCRIPTION:
${jobDescription || 'No specific job description provided'}

CURRENT RESUME CONTENT:
${typeof resumeContent === 'string' ? resumeContent : JSON.stringify(resumeContent, null, 2)}

Please provide:
1. Comprehensive keyword analysis comparing resume to job requirements
2. Specific recommendations for keyword optimization
3. Natural integration suggestions that maintain readability
4. Industry-specific keyword recommendations
5. ATS compatibility score and improvement tips

Focus on helping the candidate match job requirements while maintaining authenticity.`;

    console.log('Making request to OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `OpenAI API Error: ${response.status}`,
          atsScore: 0,
          keywordAnalysis: {
            matched: [],
            missing: [],
            density: 0,
            distribution: "api_error"
          },
          recommendations: [{
            keyword: "Service Error",
            priority: "high",
            suggestion: "Please try again later",
            naturalIntegration: "OpenAI API service is temporarily unavailable",
            section: "system"
          }],
          optimizedSections: {
            summary: "Service temporarily unavailable",
            skills: "Please try again",
            experience: "OpenAI API error occurred"
          },
          industryKeywords: {
            technical: [],
            soft: [],
            industry: []
          },
          improvementTips: [
            "Please try again in a few moments",
            "This appears to be a temporary service issue",
            "Check your internet connection"
          ]
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('OpenAI API response received successfully');
    
    const optimizationData = data.choices[0].message.content;

    let parsedData;
    try {
      parsedData = JSON.parse(optimizationData);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw AI response:', optimizationData);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to parse AI response',
          atsScore: 0,
          keywordAnalysis: {
            matched: [],
            missing: [],
            density: 0,
            distribution: "parse_error"
          },
          recommendations: [{
            keyword: "Parse Error",
            priority: "high",
            suggestion: "Please try again",
            naturalIntegration: "AI response format was invalid",
            section: "system"
          }],
          optimizedSections: {
            summary: "Unable to parse AI response",
            skills: "Please try again",
            experience: "AI response format error"
          },
          industryKeywords: {
            technical: [],
            soft: [],
            industry: []
          },
          improvementTips: [
            "Please try again",
            "This appears to be a temporary AI service issue",
            "The AI response format was invalid"
          ]
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Keyword optimization completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        ...parsedData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI keyword optimization:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Service temporarily unavailable',
        atsScore: 0,
        keywordAnalysis: {
          matched: [],
          missing: [],
          density: 0,
          distribution: "service_error"
        },
        recommendations: [{
          keyword: "Service Error",
          priority: "high",
          suggestion: "Please try again in a few moments",
          naturalIntegration: "Service is temporarily unavailable",
          section: "system"
        }],
        optimizedSections: {
          summary: "Service temporarily unavailable",
          skills: "Please try again later",
          experience: "Service error occurred"
        },
        industryKeywords: {
          technical: [],
          soft: [],
          industry: []
        },
        improvementTips: [
          "Please try again in a few moments",
          "This appears to be a temporary service issue",
          "Check your internet connection and try again"
        ]
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
