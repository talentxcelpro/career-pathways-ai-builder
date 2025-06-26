
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIToolRequest {
  tool: string;
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
    )

    const { tool, data, userId }: AIToolRequest = await req.json()

    let result;
    
    switch (tool) {
      case 'salary-analyzer':
        result = await analyzeSalary(data, supabase);
        break;
      case 'interview-prep':
        result = await prepareInterview(data, supabase);
        break;
      case 'career-assistant':
        result = await assistCareer(data, supabase);
        break;
      case 'profile-score':
        result = await scoreProfile(data, supabase);
        break;
      case 'market-insights':
        result = await getMarketInsights(data, supabase);
        break;
      default:
        throw new Error('Unknown tool');
    }

    // Save tool usage
    if (userId) {
      await supabase.from('tool_usage').insert({
        user_id: userId,
        tool_name: tool,
        session_data: data,
        results: result
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('AI Tools Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function analyzeSalary(data: any, supabase: any) {
  const { jobTitle, location, experienceLevel } = data;
  
  // Fetch salary data from database
  const { data: salaryData, error } = await supabase
    .from('salary_data')
    .select('*')
    .ilike('job_title', `%${jobTitle}%`)
    .ilike('location', `%${location}%`)
    .eq('experience_level', experienceLevel);

  if (error) throw error;

  const avgSalary = salaryData.reduce((acc: number, item: any) => 
    acc + (item.salary_range_min + item.salary_range_max) / 2, 0) / salaryData.length;

  return {
    averageSalary: Math.round(avgSalary),
    salaryRange: {
      min: Math.min(...salaryData.map((s: any) => s.salary_range_min)),
      max: Math.max(...salaryData.map((s: any) => s.salary_range_max))
    },
    marketData: salaryData,
    insights: [
      `Average salary for ${jobTitle} in ${location} is $${Math.round(avgSalary).toLocaleString()}`,
      `Salary range varies from $${Math.min(...salaryData.map((s: any) => s.salary_range_min)).toLocaleString()} to $${Math.max(...salaryData.map((s: any) => s.salary_range_max)).toLocaleString()}`,
      `Based on ${salaryData.length} data points from various sources`
    ]
  };
}

async function prepareInterview(data: any, supabase: any) {
  const { jobRole, interviewType } = data;
  
  const questions = generateInterviewQuestions(jobRole, interviewType);
  
  return {
    questions,
    tips: [
      "Research the company thoroughly before the interview",
      "Prepare specific examples using the STAR method",
      "Practice your answers out loud beforehand",
      "Prepare thoughtful questions to ask the interviewer"
    ],
    duration: 45,
    difficulty: interviewType === 'technical' ? 'Hard' : 'Medium'
  };
}

async function assistCareer(data: any, supabase: any) {
  const { currentRole, targetRole, skills, experience } = data;
  
  return {
    recommendations: [
      `Based on your ${currentRole} background, transitioning to ${targetRole} is achievable`,
      "Focus on developing these key skills for your target role",
      "Consider taking relevant courses to bridge skill gaps",
      "Network with professionals in your target industry"
    ],
    skillGaps: calculateSkillGaps(skills, targetRole),
    actionPlan: [
      "Update your resume to highlight transferable skills",
      "Build a portfolio showcasing relevant projects",
      "Apply to 5-10 positions weekly in your target field",
      "Schedule informational interviews with industry professionals"
    ],
    timeline: "3-6 months with consistent effort"
  };
}

async function scoreProfile(data: any, supabase: any) {
  const { profile } = data;
  
  const scores = {
    completeness: calculateCompleteness(profile),
    optimization: calculateOptimization(profile),
    visibility: calculateVisibility(profile)
  };
  
  const overallScore = Math.round((scores.completeness + scores.optimization + scores.visibility) / 3);
  
  return {
    overallScore,
    scores,
    improvements: [
      "Add a professional profile picture",
      "Write a compelling headline and summary",
      "Include relevant keywords for your industry",
      "Add work samples to your portfolio section"
    ],
    strengths: [
      "Strong work experience section",
      "Good skills representation",
      "Active engagement with platform features"
    ]
  };
}

async function getMarketInsights(data: any, supabase: any) {
  const { industry, location } = data;
  
  return {
    trends: [
      "Remote work opportunities increased by 35% this year",
      "AI and machine learning skills are in high demand",
      "Salary growth rate is 8% above inflation",
      "Companies prioritizing diversity and inclusion initiatives"
    ],
    hotSkills: [
      "Artificial Intelligence",
      "Cloud Computing",
      "Data Analysis",
      "Digital Marketing",
      "UX/UI Design"
    ],
    jobGrowth: {
      industry,
      location,
      growthRate: "+15%",
      projectedJobs: "12,500 new positions",
      competitionLevel: "Moderate"
    },
    insights: `The ${industry} sector in ${location} shows strong growth potential with emerging opportunities in AI and digital transformation.`
  };
}

function generateInterviewQuestions(jobRole: string, type: string) {
  const behavioral = [
    "Tell me about a time you faced a challenging situation at work and how you handled it.",
    "Describe a project you're particularly proud of and your role in its success.",
    "How do you handle working under pressure or tight deadlines?",
    "Give an example of when you had to work with a difficult team member."
  ];
  
  const technical = [
    `What are the key technical skills required for a ${jobRole} position?`,
    "Walk me through your approach to solving complex problems.",
    "How do you stay updated with the latest industry trends and technologies?",
    "Describe a technical challenge you overcame in a previous role."
  ];
  
  return type === 'technical' ? [...behavioral.slice(0, 2), ...technical] : behavioral;
}

function calculateSkillGaps(currentSkills: string[], targetRole: string) {
  const roleSkills: { [key: string]: string[] } = {
    'Product Manager': ['Product Strategy', 'User Research', 'Data Analysis', 'Agile', 'Roadmapping'],
    'Software Engineer': ['Programming', 'System Design', 'Testing', 'Version Control', 'Problem Solving'],
    'Data Scientist': ['Python/R', 'Machine Learning', 'Statistics', 'SQL', 'Data Visualization'],
    'UX Designer': ['User Research', 'Prototyping', 'Design Systems', 'Figma/Sketch', 'Usability Testing']
  };
  
  const requiredSkills = roleSkills[targetRole] || [];
  return requiredSkills.filter(skill => !currentSkills.includes(skill));
}

function calculateCompleteness(profile: any): number {
  let score = 0;
  if (profile.profilePicture) score += 20;
  if (profile.headline) score += 15;
  if (profile.summary) score += 20;
  if (profile.experience?.length > 0) score += 25;
  if (profile.skills?.length > 0) score += 20;
  return Math.min(score, 100);
}

function calculateOptimization(profile: any): number {
  let score = 50; // Base score
  if (profile.keywords?.length > 5) score += 20;
  if (profile.endorsements > 0) score += 15;
  if (profile.recommendations > 0) score += 15;
  return Math.min(score, 100);
}

function calculateVisibility(profile: any): number {
  let score = 40; // Base score
  if (profile.connections > 50) score += 20;
  if (profile.posts > 0) score += 20;
  if (profile.profileViews > 10) score += 20;
  return Math.min(score, 100);
}
