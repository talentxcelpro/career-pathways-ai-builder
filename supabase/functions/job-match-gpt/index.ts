import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

interface ResumeAnalysisRequest {
  operation: 'analyze_resume' | 'find_job_matches';
  resume_content?: string;
  analysis_data?: any;
  user_profile?: any;
  job_descriptions?: string[];
  match_criteria?: {
    include_skill_gaps?: boolean;
    include_salary_analysis?: boolean;
    max_matches?: number;
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    const body: ResumeAnalysisRequest = await req.json()

    if (body.operation === 'analyze_resume') {
      return await analyzeResume(body, user.id)
    } else if (body.operation === 'find_job_matches') {
      return await findJobMatches(body, user.id)
    } else {
      throw new Error('Invalid operation')
    }

  } catch (error) {
    console.error('Job Match GPT Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function analyzeResume(body: ResumeAnalysisRequest, userId: string) {
  console.log('Starting resume analysis...')
  
  // Mock AI-powered resume analysis
  const analysis = {
    overall_score: Math.floor(Math.random() * 30) + 70, // 70-100 range
    sections: {
      personal_info: {
        score: Math.floor(Math.random() * 20) + 80,
        suggestions: [
          'Add a professional email address',
          'Include LinkedIn profile URL',
          'Consider adding a professional summary'
        ],
        keywords_found: ['Software Engineer', 'React', 'JavaScript'],
        keywords_missing: ['TypeScript', 'Node.js']
      },
      experience: {
        score: Math.floor(Math.random() * 25) + 75,
        suggestions: [
          'Quantify achievements with specific metrics',
          'Use action verbs to start bullet points',
          'Add more technical details about projects'
        ],
        keywords_found: ['Full Stack', 'API Development', 'Database Design'],
        keywords_missing: ['Microservices', 'Cloud Computing']
      },
      skills: {
        score: Math.floor(Math.random() * 20) + 70,
        suggestions: [
          'Group skills by category (Technical, Soft Skills)',
          'Add proficiency levels for key technologies',
          'Include relevant certifications'
        ],
        keywords_found: ['React', 'Python', 'SQL', 'Git'],
        keywords_missing: ['Docker', 'Kubernetes', 'AWS']
      },
      education: {
        score: Math.floor(Math.random() * 15) + 85,
        suggestions: [
          'Include relevant coursework for entry-level positions',
          'Add GPA if above 3.5',
          'Mention academic projects'
        ],
        keywords_found: ['Computer Science', 'Bachelor\'s Degree'],
        keywords_missing: ['Relevant Coursework']
      }
    },
    ats_compatibility: {
      score: Math.floor(Math.random() * 25) + 75,
      issues: [
        'Complex formatting may not parse correctly',
        'Missing standard section headers',
        'Graphics and images can cause parsing errors'
      ],
      recommendations: [
        'Use standard fonts (Arial, Calibri, Times New Roman)',
        'Stick to bullet points for easy parsing',
        'Include both acronyms and full terms (e.g., "AI (Artificial Intelligence)")',
        'Save as both PDF and Word document'
      ]
    },
    skill_analysis: {
      technical_skills: [
        {
          skill: 'React',
          proficiency: 85,
          market_demand: 92,
          recommendations: ['Learn React Hooks', 'Master state management with Redux']
        },
        {
          skill: 'JavaScript',
          proficiency: 80,
          market_demand: 95,
          recommendations: ['Learn ES6+ features', 'Understand async/await patterns']
        },
        {
          skill: 'Python',
          proficiency: 75,
          market_demand: 88,
          recommendations: ['Learn Django or Flask', 'Practice data structures and algorithms']
        },
        {
          skill: 'SQL',
          proficiency: 70,
          market_demand: 85,
          recommendations: ['Learn advanced queries', 'Understand database optimization']
        }
      ],
      soft_skills: [
        {
          skill: 'Communication',
          evidence_found: true,
          improvement_tips: ['Highlight presentation experience', 'Mention cross-team collaboration']
        },
        {
          skill: 'Leadership',
          evidence_found: false,
          improvement_tips: ['Add examples of leading projects', 'Mention mentoring experience']
        },
        {
          skill: 'Problem Solving',
          evidence_found: true,
          improvement_tips: ['Quantify problems solved', 'Describe complex challenges overcome']
        }
      ]
    },
    career_insights: {
      current_level: 'Mid-Level Software Engineer',
      potential_roles: [
        'Senior Software Engineer',
        'Full Stack Developer',
        'Frontend Team Lead',
        'Technical Product Manager'
      ],
      salary_estimate: {
        min: 85000,
        max: 120000,
        confidence: 78
      },
      growth_recommendations: [
        'Develop leadership and mentoring skills',
        'Gain experience with cloud platforms (AWS, Azure)',
        'Learn system design and architecture patterns',
        'Contribute to open source projects',
        'Obtain relevant certifications'
      ]
    }
  }

  // Generate initial job matches
  const jobMatches = await generateJobMatches(analysis, body.user_profile)

  return new Response(
    JSON.stringify({
      success: true,
      analysis,
      job_matches: jobMatches
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function findJobMatches(body: ResumeAnalysisRequest, userId: string) {
  console.log('Finding job matches...')
  
  const matches = await generateJobMatches(body.analysis_data, body.user_profile, body.match_criteria)

  return new Response(
    JSON.stringify({
      success: true,
      matches
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function generateJobMatches(analysisData: any, userProfile: any, criteria: any = {}) {
  // Mock AI-powered job matching
  const jobMatches = [
    {
      job_id: '1',
      title: 'Senior React Developer',
      company: 'TechForward Inc.',
      location: 'San Francisco, CA (Remote)',
      salary_range: '$130,000 - $170,000',
      match_score: 94,
      skill_match: 95,
      experience_match: 92,
      location_match: 100,
      matching_skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'JavaScript'],
      skill_gaps: ['Docker', 'Kubernetes', 'AWS Lambda'],
      recommendations: [
        'Perfect skill alignment with React and TypeScript expertise',
        'Your experience level matches the senior requirements',
        'Remote work option aligns with your preferences',
        'Salary expectation within your target range',
        'Consider learning Docker for deployment skills'
      ],
      application_url: 'https://techforward.com/careers/senior-react-dev',
      posted_date: '2 days ago',
      confidence_level: 'high' as const
    },
    {
      job_id: '2',
      title: 'Full Stack Engineer',
      company: 'InnovateLabs',
      location: 'Austin, TX',
      salary_range: '$100,000 - $140,000',
      match_score: 87,
      skill_match: 88,
      experience_match: 85,
      location_match: 75,
      matching_skills: ['JavaScript', 'React', 'Python', 'PostgreSQL', 'Git'],
      skill_gaps: ['Django', 'Redis', 'Celery', 'Docker'],
      recommendations: [
        'Strong frontend skills transfer perfectly',
        'Python experience gives you an edge',
        'Backend technologies alignment is good',
        'Consider discussing remote work options',
        'Learn Django to strengthen backend skills'
      ],
      application_url: 'https://innovatelabs.com/jobs/fullstack-engineer',
      posted_date: '1 week ago',
      confidence_level: 'high' as const
    },
    {
      job_id: '3',
      title: 'Frontend Team Lead',
      company: 'DataDriven Corp',
      location: 'New York, NY',
      salary_range: '$140,000 - $180,000',
      match_score: 82,
      skill_match: 90,
      experience_match: 78,
      location_match: 70,
      matching_skills: ['React', 'JavaScript', 'Team Leadership', 'Code Review', 'Agile'],
      skill_gaps: ['Vue.js', 'Angular', 'People Management', 'Performance Optimization'],
      recommendations: [
        'Technical skills strongly aligned with requirements',
        'Leadership potential evident in your profile',
        'Great opportunity for career advancement',
        'Consider hybrid work arrangement discussion',
        'Significant salary increase potential'
      ],
      application_url: 'https://datadriven.com/careers/frontend-lead',
      posted_date: '3 days ago',
      confidence_level: 'medium' as const
    },
    {
      job_id: '4',
      title: 'Software Engineer II',
      company: 'CloudScale Technologies',
      location: 'Seattle, WA (Hybrid)',
      salary_range: '$110,000 - $145,000',
      match_score: 89,
      skill_match: 92,
      experience_match: 88,
      location_match: 85,
      matching_skills: ['React', 'Node.js', 'JavaScript', 'API Development', 'MongoDB'],
      skill_gaps: ['AWS', 'Microservices', 'Terraform'],
      recommendations: [
        'Excellent technical skill match',
        'Cloud-focused role offers growth opportunities',
        'Hybrid work model provides flexibility',
        'Strong compensation package',
        'Learn AWS for cloud architecture skills'
      ],
      application_url: 'https://cloudscale.tech/jobs/software-engineer-2',
      posted_date: '5 days ago',
      confidence_level: 'high' as const
    },
    {
      job_id: '5',
      title: 'React Native Developer',
      company: 'MobileFirst Startup',
      location: 'Remote (US)',
      salary_range: '$95,000 - $125,000',
      match_score: 78,
      skill_match: 85,
      experience_match: 70,
      location_match: 100,
      matching_skills: ['React', 'JavaScript', 'Mobile Development', 'Git'],
      skill_gaps: ['React Native', 'iOS Development', 'Android Development', 'Expo'],
      recommendations: [
        'React skills transfer well to React Native',
        'Remote work opportunity',
        'Growing mobile development market',
        'Good entry point into mobile development',
        'Learn React Native fundamentals quickly'
      ],
      application_url: 'https://mobilefirst.co/careers/react-native',
      posted_date: '1 week ago',
      confidence_level: 'medium' as const
    }
  ]

  // Apply criteria filtering if provided
  let filteredMatches = jobMatches
  
  if (criteria?.max_matches) {
    filteredMatches = filteredMatches.slice(0, criteria.max_matches)
  }

  return filteredMatches
}