
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

console.log('Keyword optimizer function starting up...');

serve(async (req) => {
  console.log(`Keyword optimizer called: ${req.method} from ${req.headers.get('Origin')}`);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Processing keyword optimization request...');
    
    const body = await req.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));
    
    const { resumeContent, jobDescription, targetRole, industry } = body;

    // Check if OpenAI API key is available
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'OpenAI API key not configured. Please contact support.',
        fallback: true
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle missing resume content with fallback
    if (!resumeContent) {
      console.log('No resume content provided, returning fallback response');
      const fallbackResponse = {
        success: true,
        atsScore: 65,
        keywordAnalysis: {
          matched: [],
          missing: ["professional", "experience", "skills", "achievements"],
          density: 0,
          distribution: "low"
        },
        recommendations: [
          {
            keyword: "professional",
            priority: "high",
            suggestion: "Add professional experience and achievements",
            naturalIntegration: "Include in summary and experience sections",
            section: "summary"
          },
          {
            keyword: "skills",
            priority: "high", 
            suggestion: "List relevant technical and soft skills",
            naturalIntegration: "Create a dedicated skills section",
            section: "skills"
          }
        ],
        optimizedSections: {
          summary: "Please upload your resume to get personalized keyword optimization suggestions.",
          skills: "Resume content needed for skills optimization",
          experience: "Add resume data to optimize experience section"
        },
        industryKeywords: {
          technical: ["software", "development", "programming", "analysis"],
          soft: ["communication", "teamwork", "leadership", "problem-solving"],
          industry: ["technology", "business", "professional", "innovation"]
        },
        improvementTips: [
          "Upload your resume to get personalized keyword suggestions",
          "Include specific technologies and tools you've worked with",
          "Add quantifiable achievements and results",
          "Use industry-specific terminology",
          "Include relevant certifications and qualifications"
        ]
      };
      
      return new Response(JSON.stringify(fallbackResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Prepare the prompt for OpenAI
    const prompt = `
    As an ATS (Applicant Tracking System) expert, analyze the following resume content and optimize it for keyword matching and ATS compatibility.

    Resume Content: ${JSON.stringify(resumeContent)}
    ${jobDescription ? `Job Description: ${jobDescription}` : ''}
    ${targetRole ? `Target Role: ${targetRole}` : ''}
    ${industry ? `Industry: ${industry}` : ''}

    Please provide:
    1. An ATS compatibility score (0-100)
    2. Analysis of matched and missing keywords
    3. Specific recommendations for improvement
    4. Optimized sections suggestions
    5. Industry-specific keywords
    6. Practical improvement tips

    Return your response in this exact JSON format:
    {
      "success": true,
      "atsScore": 85,
      "keywordAnalysis": {
        "matched": ["keyword1", "keyword2"],
        "missing": ["keyword3", "keyword4"],
        "density": 0.75,
        "distribution": "good"
      },
      "recommendations": [
        {
          "keyword": "keyword",
          "priority": "high|medium|low",
          "suggestion": "specific suggestion",
          "naturalIntegration": "how to naturally include it",
          "section": "where to place it"
        }
      ],
      "optimizedSections": {
        "summary": "optimized summary text",
        "skills": "optimized skills section",
        "experience": "optimized experience section"
      },
      "industryKeywords": {
        "technical": ["tech1", "tech2"],
        "soft": ["soft1", "soft2"],
        "industry": ["industry1", "industry2"]
      },
      "improvementTips": [
        "tip1",
        "tip2"
      ]
    }
    `;

    console.log('Sending request to OpenAI API...');
    
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
            content: 'You are an expert ATS (Applicant Tracking System) analyzer and resume optimization specialist. Always respond with valid JSON in the exact format requested.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    console.log('OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI API response received successfully');
    
    let optimizationResult;
    try {
      optimizationResult = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.log('Raw response:', data.choices[0].message.content);
      
      // Return fallback response if parsing fails
      optimizationResult = {
        success: true,
        atsScore: 70,
        keywordAnalysis: {
          matched: ["professional", "experience"],
          missing: ["skills", "achievements", "results"],
          density: 0.5,
          distribution: "moderate"
        },
        recommendations: [
          {
            keyword: "achievements",
            priority: "high",
            suggestion: "Add quantifiable achievements and results",
            naturalIntegration: "Include specific metrics and outcomes in experience section",
            section: "experience"
          }
        ],
        optimizedSections: {
          summary: "Consider adding more specific skills and achievements to your summary",
          skills: "List both technical and soft skills relevant to your field",
          experience: "Include quantifiable results and achievements in each role"
        },
        industryKeywords: {
          technical: ["analysis", "development", "implementation"],
          soft: ["leadership", "communication", "teamwork"],
          industry: ["professional", "business", "strategy"]
        },
        improvementTips: [
          "Use specific keywords from the job description",
          "Include quantifiable achievements",
          "Add relevant technical skills",
          "Use industry-standard terminology"
        ]
      };
    }

    console.log('Keyword optimization completed successfully');
    
    return new Response(JSON.stringify(optimizationResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in keyword optimization:', error);
    
    // Return a structured error response with fallback
    const errorResponse = {
      success: false,
      error: error.message || 'Failed to optimize keywords',
      fallback: {
        atsScore: 60,
        keywordAnalysis: {
          matched: [],
          missing: ["professional", "experience", "skills"],
          density: 0,
          distribution: "low"
        },
        recommendations: [
          {
            keyword: "professional",
            priority: "high",
            suggestion: "Add professional experience details",
            naturalIntegration: "Include in summary section",
            section: "summary"
          }
        ],
        optimizedSections: {
          summary: "Service temporarily unavailable. Please try again later.",
          skills: "Unable to optimize at this time",
          experience: "Please retry keyword optimization"
        },
        industryKeywords: {
          technical: ["software", "development", "analysis"],
          soft: ["communication", "teamwork", "leadership"],
          industry: ["technology", "business", "professional"]
        },
        improvementTips: [
          "Please try again later",
          "Ensure you have a stable internet connection",
          "Contact support if the issue persists"
        ]
      }
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
