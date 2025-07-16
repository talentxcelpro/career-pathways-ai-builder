import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/components/learning/types';

interface UserProfile {
  skills: string[];
  interests: string[];
  career_goals: string[];
  learning_history: string[];
  experience_level: string;
  preferred_learning_style: string;
}

interface AIRecommendation extends Course {
  match_score: number;
  reason: string;
  badge: 'Perfect Match' | 'Trending' | 'Quick Win' | 'Skill Builder' | 'Career Boost';
  priority: number;
}

export const useAIRecommendations = (courses: Course[]) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Fetch user profile and preferences
  const { data: profile } = useQuery({
    queryKey: ['user-profile-for-recommendations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('title, skills, industry, career_goals, preferences')
        .eq('id', user.id)
        .single();

      const { data: enrollmentHistory } = await supabase
        .from('user_courses')
        .select('course_id, progress_percentage, completed_at')
        .eq('user_id', user.id);

      return {
        profile: profileData,
        history: enrollmentHistory || []
      };
    },
    enabled: courses.length > 0
  });

  // Generate AI-powered recommendations
  const recommendations = useMemo((): AIRecommendation[] => {
    if (!courses.length || !profile?.profile) return [];

    const userSkills = profile.profile.skills || [];
    const userTitle = profile.profile.title || '';
    const userIndustry = profile.profile.industry || '';
    const completedCourses = profile.history?.filter(h => h.completed_at) || [];
    const inProgressCourses = profile.history?.filter(h => !h.completed_at) || [];

    return courses
      .map((course): AIRecommendation => {
        let score = 0;
        let reason = '';
        let badge: AIRecommendation['badge'] = 'Quick Win';
        let priority = 0;

        // Skill matching (40% of score)
        const courseSkills = course.skills_taught || [];
        const skillMatches = courseSkills.filter(skill => 
          userSkills.some(userSkill => 
            userSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(userSkill.toLowerCase())
          )
        );

        if (skillMatches.length > 0) {
          score += (skillMatches.length / courseSkills.length) * 40;
          reason = `Builds on your ${skillMatches.slice(0, 2).join(' and ')} skills`;
          badge = 'Skill Builder';
          priority += 3;
        }

        // Career relevance (30% of score)
        if (userTitle && course.title.toLowerCase().includes(userTitle.toLowerCase())) {
          score += 30;
          reason = `Perfect for your ${userTitle} role`;
          badge = 'Perfect Match';
          priority += 5;
        } else if (userIndustry && (course.category?.toLowerCase().includes(userIndustry.toLowerCase()) || 
                   course.description?.toLowerCase().includes(userIndustry.toLowerCase()))) {
          score += 20;
          reason = `Relevant to ${userIndustry} industry`;
          badge = 'Career Boost';
          priority += 4;
        }

        // Experience level matching (15% of score)
        const userLevel = profile.profile.title?.toLowerCase().includes('senior') ? 'advanced' :
                          profile.profile.title?.toLowerCase().includes('junior') ? 'beginner' : 'intermediate';
        
        if (course.difficulty_level === userLevel) {
          score += 15;
          priority += 2;
        } else if (
          (userLevel === 'beginner' && course.difficulty_level === 'intermediate') ||
          (userLevel === 'intermediate' && course.difficulty_level === 'advanced')
        ) {
          score += 10;
          reason = reason || 'Next step in your learning journey';
          badge = 'Skill Builder';
          priority += 3;
        }

        // Popularity and rating boost (10% of score)
        if (course.rating >= 4.5) {
          score += 5;
          badge = badge === 'Quick Win' ? 'Trending' : badge;
          priority += 2;
        }
        if (course.enrolled_count > 1000) {
          score += 5;
          badge = badge === 'Quick Win' ? 'Trending' : badge;
          priority += 1;
        }

        // Quick completion bonus (5% of score)
        if (course.duration_hours <= 10) {
          score += 5;
          if (score < 30) {
            badge = 'Quick Win';
            reason = reason || 'Quick skill boost in just a few hours';
          }
          priority += 1;
        }

        // Avoid already completed courses
        if (completedCourses.some(c => c.course_id === course.id)) {
          score *= 0.1;
          priority = 0;
        }

        // Boost courses in progress
        if (inProgressCourses.some(c => c.course_id === course.id)) {
          score *= 1.2;
          reason = 'Continue your learning journey';
          priority += 2;
        }

        // Default reason if none assigned
        if (!reason) {
          reason = course.difficulty_level === 'beginner' ? 
            'Great starting point for new skills' : 
            'Advance your expertise';
        }

        return {
          ...course,
          match_score: Math.round(score),
          reason,
          badge,
          priority
        };
      })
      .filter(rec => rec.match_score > 20) // Only show decent matches
      .sort((a, b) => {
        // Sort by priority first, then by score
        if (a.priority !== b.priority) return b.priority - a.priority;
        return b.match_score - a.match_score;
      })
      .slice(0, 6); // Top 6 recommendations
  }, [courses, profile]);

  return {
    recommendations,
    isLoading: !profile && courses.length > 0,
    userProfile: profile?.profile
  };
};