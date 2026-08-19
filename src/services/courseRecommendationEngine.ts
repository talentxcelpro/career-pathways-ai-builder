import { AggregatedCourse } from '@/types/learningAggregator';

export interface CandidateProfile {
  fullName: string;
  currentRole: string;
  experienceYears?: number;
  existingSkills: string[];
  targetRole?: string;
  maxWeeklyHours?: number;
  preferFreeCertificate?: boolean;
}

export interface RecommendationMatchResult {
  course: AggregatedCourse;
  matchScore: number; // 0 - 100%
  breakdown: {
    skillOverlapScore: number;   // 40% weight
    experienceMatchScore: number;// 20% weight
    providerTrustScore: number;  // 15% weight
    costPreferenceScore: number; // 15% weight
    freshnessScore: number;      // 10% weight
  };
  recommendationReason: string;
  skillGapsAddressed: string[];
}

export const courseRecommendationEngine = {

  /**
   * Multi-Factor Recommendation Scoring Algorithm:
   * Score = (40% Skill Overlap) + (20% Difficulty Fit) + (15% Provider Trust) + (15% Free/Cert) + (10% Freshness)
   */
  scoreCourse(course: AggregatedCourse, candidate: CandidateProfile, targetRoleSkills: string[]): RecommendationMatchResult {
    const candidateSkillSet = new Set(candidate.existingSkills.map(s => s.toLowerCase()));
    const targetSkillSet = new Set(targetRoleSkills.map(s => s.toLowerCase()));

    // 1. Skill Overlap & Gap Addressed Score (40% Weight)
    // How many target skills does this course address that the candidate DOES NOT yet have?
    const skillsAddressed: string[] = [];
    course.skills.forEach(skill => {
      const s = skill.toLowerCase();
      if (!candidateSkillSet.has(s)) {
        skillsAddressed.push(skill);
      }
    });

    let skillOverlapRatio = 0;
    if (targetSkillSet.size > 0) {
      const matchCount = course.skills.filter(sk => targetSkillSet.has(sk.toLowerCase())).length;
      skillOverlapRatio = Math.min(1, matchCount / Math.max(1, targetSkillSet.size / 2));
    } else {
      skillOverlapRatio = skillsAddressed.length > 0 ? 0.8 : 0.5;
    }
    const skillOverlapScore = Math.round(skillOverlapRatio * 40);

    // 2. Experience / Level Fit Score (20% Weight)
    let experienceMatchScore = 15;
    const exp = candidate.experienceYears || 2;
    if (exp < 2 && course.level === 'Beginner') experienceMatchScore = 20;
    else if (exp >= 2 && exp < 5 && (course.level === 'Intermediate' || course.level === 'Beginner')) experienceMatchScore = 20;
    else if (exp >= 5 && (course.level === 'Intermediate' || course.level === 'Advanced')) experienceMatchScore = 20;

    // 3. Provider Trust Score (15% Weight)
    let providerTrustScore = 12;
    if (course.provider_name.includes('MIT') || course.provider_name.includes('Harvard')) providerTrustScore = 15;
    else if (course.provider_name.includes('Microsoft') || course.provider_name.includes('IBM') || course.provider_name.includes('AWS')) providerTrustScore = 14;
    else if (course.provider_name.includes('freeCodeCamp') || course.provider_name.includes('Cisco')) providerTrustScore = 13;

    // 4. Cost & Certificate Preference Score (15% Weight)
    let costPreferenceScore = 10;
    if (course.is_free) costPreferenceScore += 3;
    if (course.certificate_type === 'FREE_CERTIFICATE') costPreferenceScore += 2;
    if (candidate.preferFreeCertificate && course.certificate_type === 'FREE_CERTIFICATE') costPreferenceScore += 2;
    costPreferenceScore = Math.min(15, costPreferenceScore);

    // 5. Freshness & Quality Score (10% Weight)
    let freshnessScore = 9;
    if (course.verification_status === 'VERIFIED') freshnessScore = 10;

    // Total Composite Score (0 - 100%)
    const totalScore = Math.min(99, Math.max(60, skillOverlapScore + experienceMatchScore + providerTrustScore + costPreferenceScore + freshnessScore));

    // Formulate human-readable reason
    let recommendationReason = `Addresses your ${skillsAddressed[0] || 'core technical'} skill gap for ${candidate.targetRole || 'your target role'}.`;
    if (course.certificate_type === 'FREE_CERTIFICATE') {
      recommendationReason += ` Includes 100% free verified credential.`;
    }

    return {
      course,
      matchScore: totalScore,
      breakdown: {
        skillOverlapScore,
        experienceMatchScore,
        providerTrustScore,
        costPreferenceScore,
        freshnessScore
      },
      recommendationReason,
      skillGapsAddressed: skillsAddressed.length > 0 ? skillsAddressed : course.skills.slice(0, 3)
    };
  },

  /**
   * Rank an array of courses against candidate profile using the multi-factor scoring formula
   */
  rankCourses(courses: AggregatedCourse[], candidate: CandidateProfile, targetRoleSkills: string[]): AggregatedCourse[] {
    const scored = courses.map(course => {
      const match = this.scoreCourse(course, candidate, targetRoleSkills);
      return {
        ...course,
        talentxcel_match: match.matchScore,
        recommendation_reason: match.recommendationReason
      };
    });

    // Sort descending by calculated match score
    return scored.sort((a, b) => (b.talentxcel_match || 0) - (a.talentxcel_match || 0));
  }
};
