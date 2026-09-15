
import { supabase } from "@/integrations/supabase/client";

export interface JobMatchResult {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}

export interface JobSuggestion {
  employment_type?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  skills_required?: string[];
}

class AIJobService {
  // Calculate job match score based on user profile and job requirements
  async calculateJobMatch(jobId: string, userId: string): Promise<JobMatchResult> {
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('skills, experience_years, industry, title')
        .eq('id', userId)
        .single();

      // Get job details
      const { data: job } = await supabase
        .from('jobs')
        .select('skills_required, experience_level, title, description')
        .eq('id', jobId)
        .single();

      if (!profile || !job) {
        return {
          matchScore: 0,
          matchingSkills: [],
          missingSkills: [],
          recommendations: []
        };
      }

      const userSkills = profile.skills || [];
      const jobSkills = job.skills_required || [];
      
      // Calculate skill match
      const matchingSkills = userSkills.filter((skill: string) => 
        jobSkills.some((jobSkill: string) => 
          jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(jobSkill.toLowerCase())
        )
      );

      const missingSkills = jobSkills.filter((jobSkill: string) => 
        !userSkills.some((skill: string) => 
          skill.toLowerCase().includes(jobSkill.toLowerCase()) ||
          jobSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );

      // Calculate match score (simplified algorithm)
      let matchScore = 0;
      
      // Skills match (60% weight)
      if (jobSkills.length > 0) {
        matchScore += (matchingSkills.length / jobSkills.length) * 60;
      }

      // Experience level match (20% weight)
      const experienceMatch = this.calculateExperienceMatch(
        profile.experience_years || 0,
        job.experience_level
      );
      matchScore += experienceMatch * 20;

      // Industry/title relevance (20% weight)
      const titleMatch = this.calculateTitleMatch(
        profile.title || '',
        job.title,
        profile.industry || ''
      );
      matchScore += titleMatch * 20;

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        matchScore,
        missingSkills,
        job.experience_level
      );

      return {
        matchScore: Math.round(matchScore),
        matchingSkills,
        missingSkills,
        recommendations
      };
    } catch (error) {
      console.error('Error calculating job match:', error);
      return {
        matchScore: 0,
        matchingSkills: [],
        missingSkills: [],
        recommendations: []
      };
    }
  }

  // Get job suggestions based on title and industry
  async getJobSuggestions(jobTitle: string, industry?: string): Promise<JobSuggestion> {
    // This would typically call an AI service, but for now we'll use rule-based logic
    const suggestions: JobSuggestion = {};

    const titleLower = jobTitle.toLowerCase();

    // Employment type suggestions
    if (titleLower.includes('intern') || titleLower.includes('trainee')) {
      suggestions.employment_type = 'internship';
    } else if (titleLower.includes('freelance') || titleLower.includes('consultant')) {
      suggestions.employment_type = 'freelance';
    } else if (titleLower.includes('contract') || titleLower.includes('temporary')) {
      suggestions.employment_type = 'contract';
    } else if (titleLower.includes('part-time')) {
      suggestions.employment_type = 'part-time';
    } else {
      suggestions.employment_type = 'full-time';
    }

    // Salary suggestions based on role and experience level
    if (titleLower.includes('senior') || titleLower.includes('lead') || titleLower.includes('principal')) {
      suggestions.salary_min = 800000;
      suggestions.salary_max = 2000000;
    } else if (titleLower.includes('junior') || titleLower.includes('entry') || titleLower.includes('intern')) {
      suggestions.salary_min = 200000;
      suggestions.salary_max = 600000;
    } else {
      suggestions.salary_min = 400000;
      suggestions.salary_max = 1200000;
    }

    // Skills suggestions based on job title
    suggestions.skills_required = this.getSkillSuggestions(jobTitle, industry);

    return suggestions;
  }

  // Get AI-powered job recommendations for a user
  async getJobRecommendations(userId: string, limit: number = 10): Promise<string[]> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('skills, experience_years, industry, title, preferred_locations')
        .eq('id', userId)
        .single();

      if (!profile) return [];

      // Get jobs that match user profile
      let query = supabase
        .from('jobs')
        .select('id, title, skills_required, experience_level, location, is_remote')
        .eq('is_active', true)
        .eq('job_status', 'open');

      // Filter by location if specified
      if (profile.preferred_locations && profile.preferred_locations.length > 0) {
        query = query.or(
          profile.preferred_locations
            .map((loc: string) => `location.ilike.%${loc}%`)
            .join(',') + ',is_remote.eq.true'
        );
      }

      const { data: jobs } = await query.limit(50);

      if (!jobs) return [];

      // Score jobs based on match with user profile
      const scoredJobs = await Promise.all(
        jobs.map(async (job) => {
          const match = await this.calculateJobMatch(job.id, userId);
          return { jobId: job.id, score: match.matchScore };
        })
      );

      // Sort by score and return top recommendations
      return scoredJobs
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(job => job.jobId);
    } catch (error) {
      console.error('Error getting job recommendations:', error);
      return [];
    }
  }

  private calculateExperienceMatch(userYears: number, jobLevel?: string): number {
    if (!jobLevel) return 0.5;

    switch (jobLevel) {
      case 'entry-level':
        return userYears <= 2 ? 1 : Math.max(0, 1 - (userYears - 2) * 0.2);
      case 'mid-level':
        return userYears >= 2 && userYears <= 5 ? 1 : 
               userYears < 2 ? userYears * 0.5 : 
               Math.max(0, 1 - (userYears - 5) * 0.1);
      case 'senior-level':
        return userYears >= 5 ? 1 : Math.max(0, userYears * 0.2);
      case 'executive':
        return userYears >= 8 ? 1 : Math.max(0, userYears * 0.125);
      default:
        return 0.5;
    }
  }

  private calculateTitleMatch(userTitle: string, jobTitle: string, userIndustry: string): number {
    const userTitleLower = userTitle.toLowerCase();
    const jobTitleLower = jobTitle.toLowerCase();
    const userIndustryLower = userIndustry.toLowerCase();

    // Simple keyword matching
    const userTitleWords = userTitleLower.split(' ');
    const jobTitleWords = jobTitleLower.split(' ');

    const matchingWords = userTitleWords.filter(word => 
      jobTitleWords.some(jobWord => 
        jobWord.includes(word) || word.includes(jobWord)
      )
    );

    let score = matchingWords.length / Math.max(userTitleWords.length, jobTitleWords.length);

    // Boost score if industries align
    if (userIndustryLower && jobTitleLower.includes(userIndustryLower)) {
      score += 0.2;
    }

    return Math.min(1, score);
  }

  private generateRecommendations(
    matchScore: number, 
    missingSkills: string[], 
    experienceLevel?: string
  ): string[] {
    const recommendations: string[] = [];

    if (matchScore < 50) {
      recommendations.push('Consider developing the missing skills to improve your match score');
    }

    if (missingSkills.length > 0) {
      recommendations.push(`Focus on learning: ${missingSkills.slice(0, 3).join(', ')}`);
    }

    if (matchScore >= 80) {
      recommendations.push('Excellent match! This role aligns well with your profile');
    } else if (matchScore >= 60) {
      recommendations.push('Good match! Consider highlighting your relevant experience');
    }

    if (experienceLevel === 'senior-level' && matchScore < 70) {
      recommendations.push('Consider gaining more experience before applying to senior roles');
    }

    return recommendations;
  }

  private getSkillSuggestions(jobTitle: string, industry?: string): string[] {
    const titleLower = jobTitle.toLowerCase();
    const suggestions: string[] = [];

    // Tech roles
    if (titleLower.includes('developer') || titleLower.includes('engineer')) {
      if (titleLower.includes('frontend') || titleLower.includes('front-end')) {
        suggestions.push('JavaScript', 'React', 'HTML', 'CSS', 'TypeScript');
      } else if (titleLower.includes('backend') || titleLower.includes('back-end')) {
        suggestions.push('Node.js', 'Python', 'Java', 'SQL', 'API Development');
      } else if (titleLower.includes('full-stack') || titleLower.includes('fullstack')) {
        suggestions.push('JavaScript', 'React', 'Node.js', 'SQL', 'MongoDB');
      } else if (titleLower.includes('mobile')) {
        suggestions.push('React Native', 'Flutter', 'iOS', 'Android', 'Mobile Development');
      } else {
        suggestions.push('Programming', 'Problem Solving', 'Git', 'Testing');
      }
    }

    // Data roles
    if (titleLower.includes('data')) {
      suggestions.push('Python', 'SQL', 'Machine Learning', 'Statistics', 'Data Analysis');
    }

    // Design roles
    if (titleLower.includes('design')) {
      suggestions.push('UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping');
    }

    // Management roles
    if (titleLower.includes('manager') || titleLower.includes('lead')) {
      suggestions.push('Leadership', 'Project Management', 'Team Management', 'Communication');
    }

    // Marketing roles
    if (titleLower.includes('marketing')) {
      suggestions.push('Digital Marketing', 'SEO', 'Content Marketing', 'Analytics');
    }

    return suggestions;
  }
}

export const aiJobService = new AIJobService();
