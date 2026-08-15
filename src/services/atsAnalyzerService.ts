import { supabase } from "@/integrations/supabase/client";

export interface ATSBreakdown {
  mustHaveScore: number;     // 0 - 35 pts
  preferredScore: number;    // 0 - 15 pts
  experienceScore: number;   // 0 - 20 pts
  hardSkillsScore: number;   // 0 - 15 pts
  semanticScore: number;     // 0 - 10 pts
  assessmentScore: number;   // 0 - 5 pts
}

export interface ATSAnalysisResult {
  score: number;
  keywordScore: number;
  formatScore: number;
  contentScore: number;
  breakdown: ATSBreakdown;
  strengthsFound: string[];
  issuesFound: string[];
  recommendations: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  explanation: string;
}

/**
 * Universal Explainable ATS Analysis Pipeline
 * Benchmark canonical resume identity against structured job requirements.
 */
export const analyzeATS = async (
  resumeData: any,
  jobDescription?: string
): Promise<ATSAnalysisResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('ats-analyzer', {
      body: { resumeData, jobDescription }
    });

    if (!error && data?.success && data?.analysis) {
      const a = data.analysis;
      return {
        score: Math.min(100, Math.max(0, Math.round(a.score || 75))),
        keywordScore: Math.min(100, Math.max(0, Math.round(a.keywordScore || 70))),
        formatScore: Math.min(100, Math.max(0, Math.round(a.formatScore || 85))),
        contentScore: Math.min(100, Math.max(0, Math.round(a.contentScore || 80))),
        breakdown: a.breakdown || calculateLocalBreakdown(resumeData, jobDescription, a.score || 75),
        strengthsFound: a.strengthsFound || ['Clean section formatting', 'Strong technical core'],
        issuesFound: a.issuesFound || [],
        recommendations: a.recommendations || ['Align bullet keywords with job description'],
        matchedKeywords: a.matchedKeywords || [],
        missingKeywords: a.missingKeywords || [],
        explanation: a.explanation || 'Analyzed via AI ATS Engine'
      };
    }
  } catch (err) {
    console.warn('⚠️ Edge function ats-analyzer unavailable, using canonical fallback engine:', err);
  }

  // Robust Local Fallback Engine
  return calculateCanonicalATSAnalysis(resumeData, jobDescription);
};

/**
 * Local Explainable ATS Analysis Engine
 * Calculates deterministic, explainable scores based on canonical identity facts.
 */
export function calculateCanonicalATSAnalysis(
  resumeData: any,
  jobDescription?: string
): ATSAnalysisResult {
  const rawSkills = (resumeData?.skills || []).map((s: any) => 
    (typeof s === 'string' ? s : s.name || s.canonicalName || '').trim()
  ).filter(Boolean);

  const rawExp = resumeData?.experience || [];
  const rawProjects = resumeData?.projects || [];
  const rawCerts = resumeData?.certifications || [];
  const hasSummary = !!(resumeData?.personalInfo?.summary);

  // Extract job keywords if jobDescription provided
  const jobText = (jobDescription || '').toLowerCase();
  const extractedJobKeywords: string[] = [];

  if (jobText.length > 20) {
    const wordMatches = jobText.match(/\b(react|node|typescript|javascript|python|java|c\+\+|aws|azure|sql|postgres|mongodb|docker|kubernetes|agile|scrum|leadership|p&l|sox|cpa|audit|quota|saas|hvac|ups|bms|cmms|m&e|lvap|hvap|rest|graphql|devops|ci\/cd|qa\/qc|hse|autocad|meal|ipc)\b/gi) || [];
    wordMatches.forEach(w => {
      const clean = w.toLowerCase();
      if (!extractedJobKeywords.includes(clean)) extractedJobKeywords.push(clean);
    });
  }

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  if (extractedJobKeywords.length > 0) {
    extractedJobKeywords.forEach(kw => {
      const isMatched = rawSkills.some((s: string) => s.toLowerCase().includes(kw));
      if (isMatched) {
        matchedKeywords.push(kw.toUpperCase());
      } else {
        missingKeywords.push(kw.toUpperCase());
      }
    });
  } else {
    // Default matching against candidate skills
    matchedKeywords.push(...rawSkills.slice(0, 8));
  }

  // 1. Must-Have Score (0 - 35)
  const mustHaveScore = extractedJobKeywords.length > 0
    ? Math.min(35, Math.round((matchedKeywords.length / Math.max(1, extractedJobKeywords.length)) * 35))
    : Math.min(35, rawSkills.length >= 5 ? 30 : rawSkills.length * 6);

  // 2. Preferred Score (0 - 15)
  const preferredScore = Math.min(15, (rawCerts.length * 5) + (hasSummary ? 5 : 0));

  // 3. Experience Score (0 - 20)
  const experienceScore = Math.min(20, Math.max(5, rawExp.length * 6));

  // 4. Hard Skills Score (0 - 15)
  const hardSkillsScore = Math.min(15, Math.round((rawSkills.length / 12) * 15));

  // 5. Semantic Match Score (0 - 10)
  const semanticScore = hasSummary ? 8 : 4;

  // 6. Assessment & Evidence Score (0 - 5)
  const assessmentScore = Math.min(5, rawProjects.length * 2 + rawCerts.length * 2);

  const breakdown: ATSBreakdown = {
    mustHaveScore,
    preferredScore,
    experienceScore,
    hardSkillsScore,
    semanticScore,
    assessmentScore
  };

  const totalScore = Math.min(100, Math.max(0, 
    mustHaveScore + preferredScore + experienceScore + hardSkillsScore + semanticScore + assessmentScore
  ));

  const keywordScore = Math.min(100, Math.max(0, Math.round((mustHaveScore / 35) * 100)));
  const formatScore = Math.min(100, Math.max(0, 85 + (rawExp.length > 0 ? 10 : 0)));
  const contentScore = Math.min(100, Math.max(0, 70 + (hasSummary ? 15 : 0) + (rawProjects.length > 0 ? 15 : 0)));

  const strengthsFound: string[] = [];
  if (rawSkills.length >= 5) strengthsFound.push(`Strong core skill density (${rawSkills.length} verified skills)`);
  if (rawExp.length > 0) strengthsFound.push(`Documented experience history across ${rawExp.length} roles`);
  if (rawProjects.length > 0) strengthsFound.push(`First-class project evidence (${rawProjects.length} projects)`);

  const issuesFound: string[] = [];
  if (!hasSummary) issuesFound.push('Missing Professional Summary section');
  if (missingKeywords.length > 0) issuesFound.push(`Missing ${missingKeywords.length} required target keywords`);

  const recommendations: string[] = [];
  if (!hasSummary) recommendations.push('Generate a 2-3 sentence Professional Summary incorporating target keywords');
  if (missingKeywords.length > 0) recommendations.push(`Incorporate key target terms: ${missingKeywords.slice(0, 4).join(', ')}`);
  if (rawProjects.length === 0) recommendations.push('Add 1-2 key technical or business projects to boost evidence alignment');

  const explanation = `Matched ${matchedKeywords.length} of ${extractedJobKeywords.length || rawSkills.length} core requirements. Must-have fit: ${mustHaveScore}/35, Experience: ${experienceScore}/20, Evidence: ${assessmentScore}/5.`;

  return {
    score: totalScore,
    keywordScore,
    formatScore,
    contentScore,
    breakdown,
    strengthsFound,
    issuesFound,
    recommendations,
    matchedKeywords,
    missingKeywords,
    explanation
  };
}

function calculateLocalBreakdown(resumeData: any, jobDescription?: string, score: number = 75): ATSBreakdown {
  return {
    mustHaveScore: Math.round(score * 0.35),
    preferredScore: Math.round(score * 0.15),
    experienceScore: Math.round(score * 0.20),
    hardSkillsScore: Math.round(score * 0.15),
    semanticScore: Math.round(score * 0.10),
    assessmentScore: Math.round(score * 0.05)
  };
}
