
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResumeAnalysisRequest {
  resumeText: string;
  jobDescription?: string;
  targetRole?: string;
  industry?: string;
}

interface DetailedScore {
  category: string;
  score: number;
  maxScore: number;
  checks: Array<{
    name: string;
    passed: boolean;
    description: string;
    impact: 'high' | 'medium' | 'low';
    suggestion?: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { resumeText, jobDescription, targetRole, industry }: ResumeAnalysisRequest = await req.json();

    console.log('Starting comprehensive resume analysis...');

    // Perform detailed analysis
    const analysisResult = await performComprehensiveAnalysis(resumeText, jobDescription, targetRole, industry);

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-resume-analyzer:', error);
    return new Response(
      JSON.stringify({ error: 'Analysis failed', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function performComprehensiveAnalysis(
  resumeText: string, 
  jobDescription?: string, 
  targetRole?: string, 
  industry?: string
) {
  // ATS Essentials Analysis
  const atsScore = analyzeATSCompatibility(resumeText);
  
  // Content Quality Analysis  
  const contentScore = analyzeContentQuality(resumeText);
  
  // Section Completeness Analysis
  const sectionScore = analyzeSectionCompleteness(resumeText);
  
  // Job Tailoring Analysis (if job description provided)
  const tailoringScore = jobDescription ? analyzeJobTailoring(resumeText, jobDescription) : null;

  // Calculate overall score
  const scores = [atsScore, contentScore, sectionScore].filter(Boolean);
  if (tailoringScore) scores.push(tailoringScore);
  
  const overallScore = Math.round(scores.reduce((acc, curr) => acc + curr.score, 0) / scores.length);

  return {
    success: true,
    overallScore,
    detailedScores: scores,
    tailoringAnalysis: tailoringScore,
    recommendations: generateRecommendations(scores),
    atsCompatibility: atsScore.score,
    improvementPriority: prioritizeImprovements(scores)
  };
}

function analyzeATSCompatibility(resumeText: string): DetailedScore {
  const checks = [
    {
      name: "ATS Parse Rate",
      passed: !resumeText.includes('|') && !resumeText.includes('•'),
      description: "Resume uses ATS-friendly formatting",
      impact: "high" as const,
      suggestion: "Remove special characters and use standard bullet points"
    },
    {
      name: "Standard Section Headers",
      passed: /experience|work|employment/i.test(resumeText) && /education/i.test(resumeText),
      description: "Uses recognizable section headers",
      impact: "high" as const,
      suggestion: "Use standard headers like 'Work Experience' and 'Education'"
    },
    {
      name: "File Format Compatibility",
      passed: true, // Assume compatible since we received text
      description: "Resume in compatible format",
      impact: "medium" as const
    },
    {
      name: "Keyword Optimization",
      passed: resumeText.split(' ').length > 300,
      description: "Sufficient keyword density",
      impact: "medium" as const,
      suggestion: "Add more relevant industry keywords"
    },
    {
      name: "Contact Information",
      passed: /@/.test(resumeText) && /\d{3}/.test(resumeText),
      description: "Complete contact details provided",
      impact: "high" as const,
      suggestion: "Ensure email and phone number are clearly visible"
    }
  ];

  const passedChecks = checks.filter(check => check.passed).length;
  const score = Math.round((passedChecks / checks.length) * 100);

  return {
    category: "ATS ESSENTIALS",
    score,
    maxScore: 100,
    checks
  };
}

function analyzeContentQuality(resumeText: string): DetailedScore {
  const checks = [
    {
      name: "Quantifying Impact",
      passed: /\d+%|\$\d+|\d+\+/.test(resumeText),
      description: "Uses numbers to demonstrate impact",
      impact: "high" as const,
      suggestion: "Add specific numbers, percentages, or dollar amounts to achievements"
    },
    {
      name: "Action Verbs",
      passed: /(managed|led|developed|created|improved|increased)/gi.test(resumeText),
      description: "Strong action verbs throughout",
      impact: "medium" as const,
      suggestion: "Start bullet points with powerful action verbs"
    },
    {
      name: "Spelling & Grammar",
      passed: !/(teh|recieve|seperate|occurence)/i.test(resumeText),
      description: "No obvious spelling errors",
      impact: "high" as const,
      suggestion: "Proofread carefully for spelling and grammar errors"
    },
    {
      name: "Professional Summary",
      passed: resumeText.toLowerCase().includes('summary') || resumeText.toLowerCase().includes('objective'),
      description: "Includes compelling summary section",
      impact: "medium" as const,
      suggestion: "Add a 2-3 line professional summary at the top"
    },
    {
      name: "Relevant Skills",
      passed: /skills|technical|proficient/i.test(resumeText),
      description: "Clearly lists relevant skills",
      impact: "medium" as const,
      suggestion: "Include a dedicated skills section with relevant abilities"
    }
  ];

  const passedChecks = checks.filter(check => check.passed).length;
  const score = Math.round((passedChecks / checks.length) * 100);

  return {
    category: "CONTENT",
    score,
    maxScore: 100,
    checks
  };
}

function analyzeSectionCompleteness(resumeText: string): DetailedScore {
  const checks = [
    {
      name: "Work Experience",
      passed: /experience|work|employment/i.test(resumeText),
      description: "Professional experience section present",
      impact: "high" as const,
      suggestion: "Add detailed work experience with achievements"
    },
    {
      name: "Education",
      passed: /education|degree|university|college/i.test(resumeText),
      description: "Education section included",
      impact: "high" as const,
      suggestion: "Include education details with degrees and institutions"
    },
    {
      name: "Skills Section",
      passed: /skills|technical|proficiencies/i.test(resumeText),
      description: "Dedicated skills section",
      impact: "medium" as const,
      suggestion: "Add a comprehensive skills section"
    },
    {
      name: "Contact Information",
      passed: /@/.test(resumeText),
      description: "Complete contact details",
      impact: "high" as const,
      suggestion: "Ensure all contact information is current and professional"
    }
  ];

  const passedChecks = checks.filter(check => check.passed).length;
  const score = Math.round((passedChecks / checks.length) * 100);

  return {
    category: "SECTIONS",
    score,
    maxScore: 100,
    checks
  };
}

function analyzeJobTailoring(resumeText: string, jobDescription: string): DetailedScore {
  const jobKeywords = extractKeywords(jobDescription);
  const resumeKeywords = extractKeywords(resumeText);
  
  const matchingKeywords = jobKeywords.filter(keyword => 
    resumeKeywords.some(resumeKeyword => 
      resumeKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
      keyword.toLowerCase().includes(resumeKeyword.toLowerCase())
    )
  );

  const matchRate = jobKeywords.length > 0 ? (matchingKeywords.length / jobKeywords.length) * 100 : 0;

  const checks = [
    {
      name: "Keyword Match",
      passed: matchRate > 60,
      description: `${matchingKeywords.length}/${jobKeywords.length} key requirements matched`,
      impact: "high" as const,
      suggestion: `Add these missing keywords: ${jobKeywords.filter(k => !matchingKeywords.includes(k)).slice(0, 3).join(', ')}`
    },
    {
      name: "Role Alignment",
      passed: matchRate > 40,
      description: "Resume aligns with target role",
      impact: "high" as const,
      suggestion: "Highlight experiences that match the job requirements"
    },
    {
      name: "Industry Language",
      passed: matchRate > 30,
      description: "Uses appropriate industry terminology",
      impact: "medium" as const,
      suggestion: "Incorporate more industry-specific language from the job posting"
    }
  ];

  return {
    category: "TAILORING",
    score: Math.round(matchRate),
    maxScore: 100,
    checks
  };
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction - in production, this would be more sophisticated
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
  
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.includes(word))
    .slice(0, 20); // Top 20 keywords
}

function generateRecommendations(scores: DetailedScore[]): string[] {
  const recommendations: string[] = [];
  
  scores.forEach(scoreCategory => {
    const failedHighImpact = scoreCategory.checks.filter(check => !check.passed && check.impact === 'high');
    failedHighImpact.forEach(check => {
      if (check.suggestion) {
        recommendations.push(check.suggestion);
      }
    });
  });

  return recommendations.slice(0, 5); // Top 5 recommendations
}

function prioritizeImprovements(scores: DetailedScore[]): Array<{priority: number, category: string, action: string}> {
  const improvements: Array<{priority: number, category: string, action: string}> = [];
  
  scores.forEach(scoreCategory => {
    const failedChecks = scoreCategory.checks.filter(check => !check.passed);
    failedChecks.forEach(check => {
      if (check.suggestion) {
        improvements.push({
          priority: check.impact === 'high' ? 1 : check.impact === 'medium' ? 2 : 3,
          category: scoreCategory.category,
          action: check.suggestion
        });
      }
    });
  });

  return improvements.sort((a, b) => a.priority - b.priority).slice(0, 8);
}
