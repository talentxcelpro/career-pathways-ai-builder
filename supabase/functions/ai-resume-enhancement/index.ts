import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ChatGPT-style enhancement handler
async function handleChatGPTStyleEnhancement(extractedData: any, userPrompt: string, enhancementType: string) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('🚀 Starting ChatGPT-style AI resume enhancement...');
  console.log('Enhancement type:', enhancementType);
  console.log('User prompt:', userPrompt);

  const systemPrompt = `You are an expert resume writer and career coach. Your task is to enhance and rewrite resumes based on user requests while maintaining professionalism and ATS optimization.

CRITICAL INSTRUCTIONS:
1. Create a COMPLETE, PROFESSIONAL resume that matches the user's request
2. Use the extracted data as foundation but enhance and expand it significantly
3. Generate realistic, professional content that fits the requested role/industry
4. Optimize for ATS (Applicant Tracking Systems) with relevant keywords
5. Use professional formatting and structure
6. Include quantified achievements where possible
7. Ensure chronological consistency
8. Return a structured JSON response

RESPONSE FORMAT:
Return ONLY a valid JSON object with this exact structure:
{
  "success": true,
  "enhancedResume": {
    "personalInfo": {
      "fullName": "string",
      "email": "string", 
      "phone": "string",
      "location": "string",
      "summary": "string (3-4 sentences, compelling professional summary)",
      "linkedin": "string (optional)",
      "website": "string (optional)",
      "confidence": 0.9
    },
    "experience": [
      {
        "title": "string (specific job title)",
        "company": "string (real or realistic company name)",
        "location": "string",
        "startDate": "string (MM/YYYY format)",
        "endDate": "string (MM/YYYY format or 'Present')",
        "description": "string (comprehensive 2-3 sentence description)",
        "achievements": ["string", "string", "string (3-5 quantified achievements)"],
        "technologies": ["string", "string (relevant technologies)"],
        "keywords": ["string", "string (ATS keywords)"],
        "confidence": 0.9
      }
    ],
    "education": [
      {
        "degree": "string (full degree name)",
        "school": "string (university/institution name)",
        "location": "string",
        "startDate": "string",
        "endDate": "string",
        "gpa": "string (optional)",
        "honors": "string (optional)",
        "relevantCoursework": ["string", "string"],
        "confidence": 0.9
      }
    ],
    "skills": {
      "technical": {
        "programming": [{"skill": "string", "proficiency": "Expert|Advanced|Intermediate", "category": "string"}],
        "frameworks": [{"skill": "string", "proficiency": "Expert|Advanced|Intermediate", "category": "string"}],
        "databases": [{"skill": "string", "proficiency": "Expert|Advanced|Intermediate", "category": "string"}],
        "tools": [{"skill": "string", "proficiency": "Expert|Advanced|Intermediate", "category": "string"}],
        "cloud": [{"skill": "string", "proficiency": "Expert|Advanced|Intermediate", "category": "string"}],
        "confidence": 0.9
      },
      "soft": [{"skill": "string", "proficiency": "Expert|Advanced|Intermediate"}],
      "languages": [{"language": "string", "proficiency": "Native|Fluent|Conversational|Basic"}],
      "certifications": ["string", "string"]
    },
    "projects": [
      {
        "title": "string",
        "description": "string (detailed project description)",
        "technologies": ["string", "string"],
        "startDate": "string (optional)",
        "endDate": "string (optional)",
        "url": "string (optional)",
        "github": "string (optional)",
        "achievements": ["string", "string"],
        "confidence": 0.9
      }
    ],
    "certifications": [
      {
        "name": "string",
        "issuer": "string",
        "date": "string",
        "expiryDate": "string (optional)",
        "credentialId": "string (optional)",
        "url": "string (optional)",
        "confidence": 0.9
      }
    ],
    "awards": [
      {
        "name": "string",
        "issuer": "string", 
        "date": "string",
        "description": "string",
        "confidence": 0.9
      }
    ],
    "atsOptimization": {
      "score": 85,
      "keywordDensity": 15,
      "sectionCompleteness": 90,
      "readabilityScore": 85,
      "suggestions": [
        {
          "category": "keywords",
          "priority": "high",
          "issue": "string",
          "suggestion": "string",
          "impact": 10
        }
      ]
    },
    "confidenceMetrics": {
      "overall": 0.9,
      "personalInfo": 0.9,
      "experience": 0.9,
      "education": 0.9,
      "skills": 0.9,
      "sections": {}
    },
    "metadata": {
      "fileName": "Enhanced Resume",
      "extractionTimestamp": "${new Date().toISOString()}",
      "extractionMethod": "AI Enhancement",
      "processingVersion": "2.0"
    }
  }
}`;

  const userMessage = `EXTRACTED RESUME DATA:
${JSON.stringify(extractedData, null, 2)}

USER REQUEST:
${userPrompt}

Please enhance this resume according to the user's request. Create a complete, professional, and ATS-optimized resume that fulfills their requirements. Ensure all sections are populated with realistic, high-quality content.`;

  console.log('📤 Sending request to OpenAI...');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const aiResponse = await response.json();
  console.log('📥 Received response from OpenAI');

  const enhancedContent = aiResponse.choices[0].message.content;
  
  // Parse the JSON response
  let parsedResponse;
  try {
    // Try to extract JSON from the response
    const jsonMatch = enhancedContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsedResponse = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON found in response');
    }
  } catch (parseError) {
    console.error('Failed to parse AI response:', parseError);
    console.log('Raw response:', enhancedContent);
    throw new Error('Failed to parse AI response as JSON');
  }

  // Validate the response structure
  if (!parsedResponse.success || !parsedResponse.enhancedResume) {
    throw new Error('Invalid response structure from AI');
  }

  console.log('✅ Resume enhancement completed successfully');

  return new Response(JSON.stringify(parsedResponse), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Support both old and new API formats
    const { 
      prompt, 
      resumeData, 
      category,
      extractedData, 
      userPrompt, 
      enhancementType = 'complete_rewrite' 
    } = body;
    
    // Check if this is the new ChatGPT-style interface
    if (extractedData && userPrompt) {
      return await handleChatGPTStyleEnhancement(extractedData, userPrompt, enhancementType);
    }
    
    // Handle legacy enhancement format

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Processing resume enhancement:', category);

    // Enhanced prompts based on category
    let systemPrompt = '';
    let legacyUserPrompt = '';

    switch (category) {
      case 'ats':
        systemPrompt = `You are an ATS optimization expert specializing in making resumes machine-readable and keyword-rich.

FOCUS AREAS:
- Add industry-specific keywords and action verbs
- Use standard section headers (Summary, Experience, Education, Skills)
- Convert passive descriptions to active achievement statements
- Include measurable results (percentages, numbers, dollar amounts)
- Optimize skill keywords for job matching algorithms
- Ensure proper formatting and structure

TRANSFORMATION RULES:
- "Responsible for managing" → "Managed and optimized"
- Add metrics: "team" → "team of 8 members"
- Include impact: "improved processes" → "improved processes resulting in 25% efficiency gain"
- Use power verbs: Achieved, Optimized, Implemented, Streamlined, Delivered

Return enhanced JSON with improved ATS compatibility.`;
        break;
      case 'achievements':
        systemPrompt = `You are a results-focused career strategist. Transform all job responsibilities into quantified achievements.

TRANSFORMATION APPROACH:
- Convert every responsibility into a measurable outcome
- Add specific numbers, percentages, and timeframes
- Highlight business impact and cost savings
- Use action verbs that demonstrate leadership and results
- Show progression and growth in responsibilities

EXAMPLES:
- "Handled customer service" → "Resolved 95% of customer inquiries within 24 hours, achieving 4.8/5 satisfaction rating"
- "Managed projects" → "Led 12+ cross-functional projects worth $2M+, delivering 100% on-time completion"
- "Worked with team" → "Collaborated with 15-member team to increase productivity by 30%"

Focus on ROI, efficiency gains, growth metrics, and business outcomes.`;
        break;
      case 'professional':
        systemPrompt = `You are a professional writing expert specializing in executive-level resume language.

ENHANCEMENT FOCUS:
- Elevate language to C-suite/executive level
- Remove casual or weak language
- Use industry-specific terminology appropriately
- Ensure consistent professional tone throughout
- Improve sentence structure and flow
- Remove redundancy and filler words

LANGUAGE IMPROVEMENTS:
- "Good at" → "Expertise in"
- "Helped with" → "Instrumental in driving"
- "Did work on" → "Spearheaded initiatives for"
- Simple past tense → Dynamic action statements

Create polished, executive-ready content with sophisticated vocabulary.`;
        break;
      case 'general':
        systemPrompt = `You are a comprehensive resume enhancement specialist. Improve all aspects of the resume content.

MULTI-FACETED ENHANCEMENT:
- Professional language and tone
- Quantified achievements and metrics
- ATS-optimized keywords
- Clear, impactful formatting
- Stronger action verbs and power words
- Industry-relevant terminology
- Logical flow and structure

COMPREHENSIVE IMPROVEMENTS:
- Enhance weak bullet points with specific accomplishments
- Add missing metrics and quantifiable results
- Improve professional summary with key value propositions
- Optimize skills section with relevant keywords
- Ensure consistency in formatting and style

Transform the entire resume into a compelling, professional document.`;
        break;
      default:
        systemPrompt = `You are a comprehensive resume enhancement expert. Analyze the provided content and improve it for maximum impact, ATS compatibility, and professional presentation. Focus on quantified achievements, professional language, and keyword optimization.`;
    }

    legacyUserPrompt = `${prompt}\n\nResume Data:\n${resumeData}\n\nPlease enhance this resume data and return it in the exact same JSON structure. Maintain all existing sections and structure while improving the content quality.`;

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
          { role: 'user', content: legacyUserPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`AI enhancement failed: ${response.status}`);
    }

    const data = await response.json();
    const enhancement = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        enhancement,
        category,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI resume enhancement:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});