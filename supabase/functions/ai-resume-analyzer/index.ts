import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OptimizationRequest {
  resumeData: any;
  atsScore?: any;
  jobMatchResult?: any;
  action: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { resumeData, atsScore, jobMatchResult, action }: OptimizationRequest = await req.json();

    if (!resumeData) {
      return new Response(
        JSON.stringify({ error: 'Resume data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting resume optimization for:', resumeData.personalInfo?.fullName);

    const resumeText = createResumeText(resumeData);
    const analysisContext = createAnalysisContext(atsScore, jobMatchResult);

    const optimizationPrompt = `
You are an expert resume optimization specialist. Based on the analysis provided, generate specific, actionable optimization suggestions for this resume.

${analysisContext}

RESUME CONTENT:
${resumeText}

Generate optimization suggestions in the following JSON format:
{
  "suggestions": [
    {
      "id": "unique-id",
      "type": "summary|experience|skills|projects|education",
      "title": "Brief suggestion title",
      "description": "What needs to be improved",
      "impact": "high|medium|low",
      "category": "keywords|formatting|content|ats",
      "originalText": "Current text (if applicable)",
      "suggestedText": "Improved version",
      "explanation": "Why this improvement helps"
    }
  ]
}

Focus on:
1. ATS-friendly improvements
2. Keyword optimization
3. Quantifiable achievements
4. Professional language enhancement
5. Structural improvements

Provide 5-10 high-impact suggestions that will measurably improve the resume.`;

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
            content: 'You are an expert resume optimization specialist. Generate specific, actionable suggestions in valid JSON format.'
          },
          {
            role: 'user',
            content: optimizationPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const optimizationText = data.choices[0].message.content;

    console.log('Raw optimization response:', optimizationText);

    let optimizations;
    try {
      optimizations = JSON.parse(optimizationText);
    } catch (parseError) {
      console.error('Failed to parse optimization JSON:', parseError);
      // Provide fallback optimizations
      optimizations = createFallbackOptimizations(resumeData);
    }

    // Ensure suggestions have unique IDs
    if (optimizations.suggestions) {
      optimizations.suggestions = optimizations.suggestions.map((suggestion: any, index: number) => ({
        ...suggestion,
        id: suggestion.id || `opt-${Date.now()}-${index}`
      }));
    }

    console.log('Optimization suggestions generated:', optimizations);

    return new Response(
      JSON.stringify({
        success: true,
        optimizations
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Resume optimization error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Resume optimization failed'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function createResumeText(resumeData: any): string {
  let text = '';
  
  if (resumeData.personalInfo) {
    text += `Name: ${resumeData.personalInfo.fullName || 'N/A'}\n`;
    if (resumeData.personalInfo.summary) {
      text += `Summary: ${resumeData.personalInfo.summary}\n\n`;
    }
  }

  if (resumeData.experience?.length > 0) {
    text += 'EXPERIENCE:\n';
    resumeData.experience.forEach((exp: any) => {
      text += `${exp.position || 'Position'} at ${exp.company || 'Company'}\n`;
      text += `${exp.description || ''}\n\n`;
    });
  }

  if (resumeData.skills?.length > 0) {
    text += 'SKILLS:\n' + resumeData.skills.join(', ') + '\n\n';
  }

  if (resumeData.projects?.length > 0) {
    text += 'PROJECTS:\n';
    resumeData.projects.forEach((project: any) => {
      text += `${project.title || 'Project'}: ${project.description || ''}\n`;
    });
  }

  return text;
}

function createAnalysisContext(atsScore: any, jobMatchResult: any): string {
  let context = '';
  
  if (atsScore) {
    context += `ATS Analysis Results:
- Overall Score: ${atsScore.score}/100
- Keywords Score: ${atsScore.breakdown?.keywords || 'N/A'}
- Formatting Score: ${atsScore.breakdown?.formatting || 'N/A'}
- Weaknesses: ${atsScore.weaknesses?.join(', ') || 'None identified'}

`;
  }

  if (jobMatchResult) {
    context += `Job Match Analysis:
- Match Score: ${Math.round(jobMatchResult.matchScore)}%
- Missing Keywords: ${jobMatchResult.missing?.join(', ') || 'None'}
- Recommendations: ${jobMatchResult.recommendations?.join('; ') || 'None'}

`;
  }

  return context;
}

function createFallbackOptimizations(resumeData: any) {
  const suggestions = [];

  // Summary optimization
  if (resumeData.personalInfo?.summary) {
    suggestions.push({
      id: `opt-${Date.now()}-1`,
      type: 'summary',
      title: 'Enhance Professional Summary',
      description: 'Add quantifiable achievements and industry keywords',
      impact: 'high',
      category: 'content',
      originalText: resumeData.personalInfo.summary,
      suggestedText: 'Results-driven professional with X+ years of experience in [industry]. Proven track record of [specific achievement]. Skilled in [key technologies/skills].',
      explanation: 'A strong summary with metrics and keywords improves ATS ranking and recruiter engagement'
    });
  }

  // Skills optimization
  if (resumeData.skills?.length > 0) {
    suggestions.push({
      id: `opt-${Date.now()}-2`,
      type: 'skills',
      title: 'Optimize Skills Section',
      description: 'Add more relevant technical and soft skills',
      impact: 'medium',
      category: 'keywords',
      suggestedText: 'Consider adding: project management, data analysis, communication, leadership',
      explanation: 'Comprehensive skills sections improve keyword matching in ATS systems'
    });
  }

  // Experience optimization
  if (resumeData.experience?.length > 0) {
    suggestions.push({
      id: `opt-${Date.now()}-3`,
      type: 'experience',
      title: 'Quantify Achievements',
      description: 'Add specific metrics and results to your accomplishments',
      impact: 'high',
      category: 'content',
      suggestedText: 'Include numbers like: "Increased sales by 25%", "Managed team of 10", "Reduced costs by $50K"',
      explanation: 'Quantified achievements demonstrate concrete value and impact to employers'
    });
  }

  return { suggestions };
}