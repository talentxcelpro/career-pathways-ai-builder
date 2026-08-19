import { supabase } from '@/integrations/supabase/client';
import { AggregatedCourse } from '@/types/learningAggregator';
import { INITIAL_AGGREGATED_COURSES } from '@/data/learningAggregatorData';

export interface SkillNode {
  id: string;
  name: string;
  slug: string;
  category: string;
}

export interface SkillGapAnalysis {
  targetRole: string;
  userVerifiedSkills: string[];
  jobRequiredSkills: string[];
  missingSkills: string[];
  skillMatchPercentage: number;
  gapClosingCourses: AggregatedCourse[];
}

export const skillGraphService = {

  /**
   * Calculate precise candidate skill gap analysis against target role required skills
   */
  async calculateSkillGap(
    targetRole: string, 
    userSkills: string[]
  ): Promise<SkillGapAnalysis> {
    const roleClean = targetRole.toLowerCase();

    // Default target role competency requirements
    let jobRequiredSkills: string[] = ['SQL & Database Queries', 'Power BI & DAX', 'Data Visualization'];
    
    if (roleClean.includes('hr') || roleClean.includes('people')) {
      jobRequiredSkills = ['HR Analytics & People Metrics', 'SQL & Database Queries', 'Excel'];
    } else if (roleClean.includes('ai') || roleClean.includes('machine learning')) {
      jobRequiredSkills = ['AI & Machine Learning Foundations', 'Python Programming', 'SQL & Database Queries'];
    } else if (roleClean.includes('vp') || roleClean.includes('operations') || roleClean.includes('management')) {
      jobRequiredSkills = ['Operations & Process Optimization', 'Financial Modeling & Valuation', 'Power BI & DAX'];
    } else if (roleClean.includes('developer') || roleClean.includes('software')) {
      jobRequiredSkills = ['Python Programming', 'SQL & Database Queries', 'Git Version Control'];
    }

    // Normalize comparison
    const normalizedUserSkills = userSkills.map(s => s.toLowerCase());
    const missingSkills = jobRequiredSkills.filter(req => 
      !normalizedUserSkills.some(usr => usr.includes(req.toLowerCase()) || req.toLowerCase().includes(usr))
    );

    const matchCount = jobRequiredSkills.length - missingSkills.length;
    const matchPercentage = Math.round((matchCount / jobRequiredSkills.length) * 100);

    // Fetch verified courses that directly teach the missing skills
    let gapClosingCourses: AggregatedCourse[] = [];
    try {
      const { data } = await supabase
        .from('aggregated_courses' as any)
        .select('*')
        .eq('verification_status', 'VERIFIED');

      if (data && data.length > 0) {
        gapClosingCourses = (data as any).filter((c: AggregatedCourse) => 
          missingSkills.some(ms => c.skills.some(cs => cs.toLowerCase().includes(ms.toLowerCase()) || ms.toLowerCase().includes(cs.toLowerCase())))
        );
      }
    } catch {
      // Fallback to verified flagship courses
    }

    if (gapClosingCourses.length === 0) {
      gapClosingCourses = INITIAL_AGGREGATED_COURSES.filter(c => 
        missingSkills.some(ms => c.skills.some(cs => cs.toLowerCase().includes(ms.toLowerCase()) || ms.toLowerCase().includes(cs.toLowerCase())))
      );
    }

    if (gapClosingCourses.length === 0) {
      gapClosingCourses = INITIAL_AGGREGATED_COURSES.slice(0, 2);
    }

    return {
      targetRole,
      userVerifiedSkills: userSkills,
      jobRequiredSkills,
      missingSkills,
      skillMatchPercentage: matchPercentage,
      gapClosingCourses
    };
  }
};
