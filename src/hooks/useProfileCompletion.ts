import { useMemo } from 'react';

interface ProfileCompletionCriteria {
  basicInfo: boolean;
  professionalInfo: boolean;
  aboutSection: boolean;
  socialLinks: boolean;
  skills: boolean;
  workExperience: boolean;
  profileImages: boolean;
  resume: boolean;
}

interface CompletionResult {
  percentage: number;
  criteria: ProfileCompletionCriteria;
  completedCount: number;
  totalCount: number;
}

export const useProfileCompletion = (user: any): CompletionResult => {
  return useMemo(() => {
    if (!user) {
      return {
        percentage: 0,
        criteria: {
          basicInfo: false,
          professionalInfo: false,
          aboutSection: false,
          socialLinks: false,
          skills: false,
          workExperience: false,
          profileImages: false,
          resume: false,
        },
        completedCount: 0,
        totalCount: 8,
      };
    }

    const criteria: ProfileCompletionCriteria = {
      // Basic Info (name, email, phone, location)
      basicInfo: !!(user.full_name && user.email && user.phone && user.location),
      
      // Professional Info (title, company, industry, experience)
      professionalInfo: !!(user.title && user.current_company && user.industry && user.experience_years),
      
      // About Section (about text and headline)
      aboutSection: !!(user.about && user.headline),
      
      // Social Links (at least 2 of: LinkedIn, GitHub, Portfolio, Website)
      socialLinks: [user.linkedin_url, user.github_url, user.portfolio_url, user.website]
        .filter(Boolean).length >= 2,
      
      // Skills (at least 3 skills)
      skills: !!(user.skills && Array.isArray(user.skills) && user.skills.length >= 3),
      
      // Work Experience (has work experience data)
      workExperience: !!(user.work_experiences && 
        typeof user.work_experiences === 'object' && 
        Object.keys(user.work_experiences).length > 0),
      
      // Profile Images (profile picture and banner/cover)
      profileImages: !!(user.profile_picture_url && 
        (user.banner_url || user.cover_image_url)),
      
      // Resume (has resume uploaded)
      resume: !!user.resume_url,
    };

    const completedCount = Object.values(criteria).filter(Boolean).length;
    const totalCount = Object.keys(criteria).length;
    const percentage = Math.round((completedCount / totalCount) * 100);

    return {
      percentage,
      criteria,
      completedCount,
      totalCount,
    };
  }, [user]);
};

export const getCompletionLevel = (percentage: number): 'low' | 'medium' | 'high' => {
  if (percentage <= 25) return 'low';
  if (percentage <= 75) return 'medium';
  return 'high';
};

export const getCompletionColor = (percentage: number): string => {
  if (percentage <= 25) return 'text-red-600';
  if (percentage <= 75) return 'text-orange-600';
  return 'text-green-600';
};

export const getCompletionBgColor = (percentage: number): string => {
  if (percentage <= 25) return 'bg-red-100';
  if (percentage <= 75) return 'bg-orange-100';
  return 'bg-green-100';
};