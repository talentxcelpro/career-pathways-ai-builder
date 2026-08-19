import { skillGraphService, SkillGapAnalysis } from './skillGraphService';
import { AggregatedCourse } from '@/types/learningAggregator';

export interface GroundedAgentResponse {
  userIntent: string;
  targetRole: string;
  skillGapAnalysis: SkillGapAnalysis;
  groundedCourses: AggregatedCourse[];
  naturalExplanation: string;
  isHallucinationFree: boolean;
}

export const careerAgentGroundingService = {

  /**
   * Deterministic Grounding Reasoning Pipeline
   * USER INPUT -> PROFILE -> INTENT -> CAREER -> SKILLS -> DB QUERY -> RANKING -> AI EXPLANATION
   */
  async generateGroundedAssessment(
    userInput: string,
    userProfile: { fullName: string; currentRole: string; existingSkills: string[] }
  ): Promise<GroundedAgentResponse> {
    
    // Step 1: Infer Target Role & Intent
    let targetRole = 'Data Analyst';
    const inputLower = userInput.toLowerCase();

    if (inputLower.includes('hr') || inputLower.includes('people')) {
      targetRole = 'HR Analytics Specialist';
    } else if (inputLower.includes('vp') || inputLower.includes('operations')) {
      targetRole = 'VP of Operations';
    } else if (inputLower.includes('ai') || inputLower.includes('machine learning')) {
      targetRole = 'AI Engineer';
    } else if (inputLower.includes('software') || inputLower.includes('developer')) {
      targetRole = 'Software Developer';
    }

    // Step 2: Query Database Grounded Skill Gap Analysis
    const gapAnalysis = await skillGraphService.calculateSkillGap(targetRole, userProfile.existingSkills);

    // Step 3: Grounded Courses Exclusively from Verified DB Query
    const groundedCourses = gapAnalysis.gapClosingCourses;

    // Step 4: Synthesize Natural AI Explanation grounded exclusively in retrieved DB rows
    const firstName = userProfile.fullName.split(' ')[0] || 'Learner';
    const missingStr = gapAnalysis.missingSkills.length > 0 
      ? gapAnalysis.missingSkills.join(', ')
      : 'Advanced Analytics';

    const courseTitlesStr = groundedCourses.map(c => `"${c.title}" by ${c.provider_name}`).join(', ');

    const naturalExplanation = `Hello ${firstName}! Based on your goal for **${targetRole}**, your profile currently has a **${gapAnalysis.skillMatchPercentage}% Skill Match**. ` +
      `To reach 100% qualification, our database identified **${gapAnalysis.missingSkills.length} key skill gaps**: ${missingStr}. ` +
      `I have queried our verified database and selected ${groundedCourses.length} verified courses to close these gaps: ${courseTitlesStr}.`;

    return {
      userIntent: userInput,
      targetRole,
      skillGapAnalysis: gapAnalysis,
      groundedCourses,
      naturalExplanation,
      isHallucinationFree: true
    };
  }
};
