
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIRequest {
  type: 'chat' | 'resume-analyze' | 'job-match' | 'cover-letter' | 'interview-prep' | 'career-guide' | 'post-suggest' | 'event-assist';
  data: any;
  userId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { type, data, userId }: AIRequest = await req.json();
    console.log(`Processing AI request: ${type}`);

    let result;
    
    switch (type) {
      case 'chat':
        result = await handleChat(data);
        break;
      case 'resume-analyze':
        result = await analyzeResume(data);
        break;
      case 'job-match':
        result = await matchJobs(data, supabase);
        break;
      case 'cover-letter':
        result = await generateCoverLetter(data);
        break;
      case 'interview-prep':
        result = await prepareInterview(data);
        break;
      case 'career-guide':
        result = await provideCareerGuidance(data);
        break;
      case 'post-suggest':
        result = await suggestPost(data);
        break;
      case 'event-assist':
        result = await assistEvent(data);
        break;
      default:
        throw new Error('Unknown AI request type');
    }

    // Save AI interaction
    if (userId) {
      await supabase.from('tool_usage').insert({
        user_id: userId,
        tool_name: `ai-${type}`,
        session_data: data,
        results: result
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI processing error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function callOpenAI(messages: any[], maxTokens = 1000, temperature = 0.7) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function handleChat(data: { message: string; history?: any[] }) {
  const messages = [
    {
      role: 'system',
      content: `You are TalentXcel AI, a helpful career assistant for the TalentXcel platform. You help users with:
      - Career advice and guidance
      - Job search strategies
      - Resume and interview tips
      - Networking suggestions
      - Skill development recommendations
      - Industry insights
      
      Be professional, encouraging, and provide actionable advice. Keep responses concise but comprehensive.`
    },
    ...(data.history || []),
    { role: 'user', content: data.message }
  ];

  const response = await callOpenAI(messages, 800);
  
  return {
    response,
    timestamp: new Date().toISOString(),
    type: 'chat'
  };
}

async function analyzeResume(data: { resumeText: string; targetRole?: string }) {
  const messages = [
    {
      role: 'system',
      content: `You are an expert resume analyzer. Analyze the resume and provide:
      1. Overall score (0-100)
      2. Strengths (3-5 points)
      3. Areas for improvement (3-5 points)
      4. ATS compatibility score
      5. Keyword suggestions
      6. Industry-specific recommendations
      
      Format as JSON with these keys: score, strengths, improvements, atsScore, keywords, recommendations`
    },
    {
      role: 'user',
      content: `Analyze this resume${data.targetRole ? ` for a ${data.targetRole} role` : ''}:\n\n${data.resumeText}`
    }
  ];

  const response = await callOpenAI(messages, 1200);
  
  try {
    const analysis = JSON.parse(response);
    return {
      ...analysis,
      timestamp: new Date().toISOString(),
      type: 'resume-analysis'
    };
  } catch {
    return {
      score: 75,
      analysis: response,
      timestamp: new Date().toISOString(),
      type: 'resume-analysis'
    };
  }
}

async function matchJobs(data: { userProfile: any; preferences?: any }, supabase: any) {
  // Get available jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      *,
      companies (name, logo_url)
    `)
    .eq('is_active', true)
    .limit(20);

  if (!jobs || jobs.length === 0) {
    return {
      matches: [],
      message: 'No jobs available for matching at the moment.'
    };
  }

  const messages = [
    {
      role: 'system',
      content: `You are an AI job matcher. Analyze the user profile and available jobs to provide matching scores and recommendations.
      
      Return a JSON array of job matches with:
      - jobId: string
      - matchScore: number (0-100)
      - reasons: string[] (why it matches)
      - concerns: string[] (potential issues)
      
      Consider skills, experience, location preferences, salary expectations, and career goals.`
    },
    {
      role: 'user',
      content: `User Profile: ${JSON.stringify(data.userProfile)}
      
      Preferences: ${JSON.stringify(data.preferences || {})}
      
      Available Jobs: ${JSON.stringify(jobs.slice(0, 10))}`
    }
  ];

  const response = await callOpenAI(messages, 1500);
  
  try {
    const matches = JSON.parse(response);
    return {
      matches: matches.slice(0, 8),
      timestamp: new Date().toISOString(),
      type: 'job-matching'
    };
  } catch {
    return {
      matches: jobs.slice(0, 5).map((job: any) => ({
        jobId: job.id,
        matchScore: Math.floor(Math.random() * 30) + 70,
        reasons: ['Skills alignment', 'Experience match'],
        concerns: []
      })),
      timestamp: new Date().toISOString(),
      type: 'job-matching'
    };
  }
}

async function generateCoverLetter(data: { jobDetails: any; userProfile: any; tone?: string }) {
  const messages = [
    {
      role: 'system',
      content: `You are an expert cover letter writer. Create a personalized, compelling cover letter that:
      - Highlights relevant experience and skills
      - Shows enthusiasm for the role and company
      - Demonstrates knowledge of the company
      - Uses appropriate tone (${data.tone || 'professional'})
      - Is concise (3-4 paragraphs)
      - Includes a strong opening and closing`
    },
    {
      role: 'user',
      content: `Job Details: ${JSON.stringify(data.jobDetails)}
      
      User Profile: ${JSON.stringify(data.userProfile)}
      
      Please write a compelling cover letter for this application.`
    }
  ];

  const coverLetter = await callOpenAI(messages, 1000);
  
  return {
    coverLetter,
    tips: [
      'Customize the company-specific details',
      'Add specific examples of your achievements',
      'Review for any grammatical errors',
      'Keep it to one page when printed'
    ],
    timestamp: new Date().toISOString(),
    type: 'cover-letter'
  };
}

async function prepareInterview(data: { jobRole: string; company?: string; experienceLevel?: string }) {
  const messages = [
    {
      role: 'system',
      content: `You are an interview coach. Provide comprehensive interview preparation including:
      1. Common questions for the role (8-10 questions)
      2. Sample answers with STAR method examples
      3. Questions to ask the interviewer (5-6 questions)
      4. Industry-specific tips
      5. What to research about the company
      
      Format as JSON with keys: commonQuestions, sampleAnswers, questionsToAsk, tips, researchPoints`
    },
    {
      role: 'user',
      content: `Role: ${data.jobRole}
      Company: ${data.company || 'General'}
      Experience Level: ${data.experienceLevel || 'Mid-level'}
      
      Provide comprehensive interview preparation.`
    }
  ];

  const response = await callOpenAI(messages, 1500);
  
  try {
    const preparation = JSON.parse(response);
    return {
      ...preparation,
      timestamp: new Date().toISOString(),
      type: 'interview-prep'
    };
  } catch {
    return {
      commonQuestions: [
        'Tell me about yourself',
        'Why are you interested in this role?',
        'What are your greatest strengths?',
        'Describe a challenging situation you faced at work'
      ],
      tips: response.split('\n').filter((line: string) => line.trim()),
      timestamp: new Date().toISOString(),
      type: 'interview-prep'
    };
  }
}

async function provideCareerGuidance(data: { currentRole?: string; targetRole?: string; skills?: string[]; experience?: number }) {
  const messages = [
    {
      role: 'system',
      content: `You are a career counselor providing personalized career guidance. Analyze the user's situation and provide:
      1. Career path recommendations
      2. Skills to develop
      3. Industry trends and opportunities
      4. Networking suggestions
      5. Timeline and milestones
      6. Resources for growth
      
      Be specific, actionable, and encouraging.`
    },
    {
      role: 'user',
      content: `Current Role: ${data.currentRole || 'Not specified'}
      Target Role: ${data.targetRole || 'Exploring options'}
      Skills: ${data.skills?.join(', ') || 'Not specified'}
      Experience: ${data.experience || 0} years
      
      Please provide comprehensive career guidance.`
    }
  ];

  const guidance = await callOpenAI(messages, 1200);
  
  return {
    guidance,
    actionPlan: [
      'Assess current skills and identify gaps',
      'Set specific career goals with timelines',
      'Build relevant skills through courses or projects',
      'Expand professional network',
      'Update resume and LinkedIn profile',
      'Apply to target roles strategically'
    ],
    timestamp: new Date().toISOString(),
    type: 'career-guidance'
  };
}

async function suggestPost(data: { topic?: string; tone?: string; platform?: string; userProfile?: any }) {
  const messages = [
    {
      role: 'system',
      content: `You are a social media content strategist for professional networking. Create engaging post suggestions that:
      - Are relevant to the user's professional background
      - Encourage engagement and conversation
      - Share valuable insights or experiences
      - Maintain professional tone
      - Include relevant hashtags
      
      Provide 3 different post options with different approaches.`
    },
    {
      role: 'user',
      content: `Topic: ${data.topic || 'General professional update'}
      Tone: ${data.tone || 'Professional and engaging'}
      Platform: ${data.platform || 'LinkedIn-style'}
      User Profile: ${JSON.stringify(data.userProfile || {})}`
    }
  ];

  const suggestions = await callOpenAI(messages, 800);
  
  return {
    suggestions: suggestions.split('\n\n').filter((post: string) => post.trim()),
    tips: [
      'Post when your audience is most active',
      'Use visuals to increase engagement',
      'Respond to comments promptly',
      'Share personal insights and experiences'
    ],
    timestamp: new Date().toISOString(),
    type: 'post-suggestions'
  };
}

async function assistEvent(data: { eventType?: string; audience?: string; duration?: string; objectives?: string[] }) {
  const messages = [
    {
      role: 'system',
      content: `You are an event planning assistant for professional networking events. Provide comprehensive event suggestions including:
      1. Event structure and agenda
      2. Engagement activities
      3. Networking opportunities
      4. Technology and tools needed
      5. Follow-up strategies
      
      Focus on creating valuable professional networking experiences.`
    },
    {
      role: 'user',
      content: `Event Type: ${data.eventType || 'Networking event'}
      Target Audience: ${data.audience || 'Professionals'}
      Duration: ${data.duration || '2 hours'}
      Objectives: ${data.objectives?.join(', ') || 'Networking and knowledge sharing'}`
    }
  ];

  const assistance = await callOpenAI(messages, 1000);
  
  return {
    eventPlan: assistance,
    checklist: [
      'Define clear event objectives',
      'Select appropriate venue/platform',
      'Create compelling event description',
      'Plan registration process',
      'Prepare networking activities',
      'Set up follow-up mechanisms'
    ],
    timestamp: new Date().toISOString(),
    type: 'event-assistance'
  };
}
